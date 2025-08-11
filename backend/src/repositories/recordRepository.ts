import { db } from "../database/db";
import { HospitalRecord } from "../models/hospitalRecord";
import { UrgencyClassification } from "../models/hospitalRecord";
import { RecordCanceledRepository } from './recordCanceledRepository';
import { RecordFinishedRepository } from './recordFinishedRepository';

export const RecordRepository = {

  findActiveByPatient(patient_id: string): HospitalRecord[] {
    const stmt = db.prepare(`
      SELECT * FROM Record
      WHERE patient_id = ? AND status IN ('Waiting Triage', 'In Triage', 'Waiting Appointment')
    `);
    return stmt.all(patient_id) as HospitalRecord[];
  },

  cancelByPatient(patient_id: string) {
    db.prepare(`
      UPDATE Record SET status = 'Canceled'
      WHERE patient_id = ? AND status IN ('Waiting Triage', 'In Triage', 'Waiting Appointment')
    `).run(patient_id);

    this.moveCanceledToBackup(patient_id);
  },

  insert(record: HospitalRecord) {
    const insertRecordStmt = db.prepare(`
      INSERT INTO Record (
        patient_id, admission_date, arrival_time, urgency_classification, status
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const insertOrIncrementLastDaysStmt = db.prepare(`
      INSERT INTO LastDays (date, quantity)
      VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET quantity = quantity + 1
    `);

    const transaction = db.transaction((rec: HospitalRecord) => {
      insertRecordStmt.run(
        rec.patient_id,
        rec.admission_date,
        rec.arrival_time,
        "triage",
        rec.status
      );
      insertOrIncrementLastDaysStmt.run(rec.admission_date);
    });

    transaction(record);
  },

  findLatestByPatient(patient_id: string): HospitalRecord | undefined {
    const stmt = db.prepare(`
      SELECT * FROM Record
      WHERE patient_id = ? AND status IN ('Waiting Triage', 'In Triage', 'Waiting Appointment')
      ORDER BY id DESC LIMIT 1
    `);
    return stmt.get(patient_id) as HospitalRecord | undefined;
  },

  updateTriageCall(patient_id: string, triage_time: string, wait_time: string) {
    db.prepare(`
      UPDATE Record
      SET triage_call_time = ?, triage_wait_time = ?, status = 'In Triage'
      WHERE patient_id = ? AND status = 'Waiting Triage'
    `).run(triage_time, wait_time, patient_id);
  },

  updateUrgencyDefinition(patient_id: string, time: string, classification: string) {
    db.prepare(`
      UPDATE Record
      SET urgency_definition_time = ?, urgency_classification = ?, status = 'Waiting Appointment'
      WHERE patient_id = ? AND status = 'In Triage'
    `).run(time, classification, patient_id);
  },

  updateAppointmentCall(patient_id: string, time: string, wait_time: string) {
    db.prepare(`
      UPDATE Record
      SET appointment_call_time = ?, appointment_wait_time = ?, status = 'Finished'
      WHERE patient_id = ? AND status = 'Waiting Appointment'
    `).run(time, wait_time, patient_id);

    this.moveFinishedToBackup(patient_id);
  },

  moveCanceledToBackup(patient_id: string) {
    const canceledRecords = db.prepare(`
      SELECT * FROM Record
      WHERE patient_id = ? AND status = 'Canceled'
    `).all(patient_id) as HospitalRecord[];

    const deleteCanceled = db.prepare(`
      DELETE FROM Record
      WHERE id = ?
    `);

    const transaction = db.transaction(() => {
      for (const rec of canceledRecords) {
        RecordCanceledRepository.insertCanceledRecord(rec);
        deleteCanceled.run(rec.id);
      }
    });

    transaction();
  },

  moveFinishedToBackup(patient_id: string) {
    const finishedRecords = db.prepare(`
      SELECT * FROM Record
      WHERE patient_id = ? AND status = 'Finished'
    `).all(patient_id) as HospitalRecord[];

    const deleteFinished = db.prepare(`
      DELETE FROM Record
      WHERE id = ?
    `);

    const transaction = db.transaction(() => {
      for (const rec of finishedRecords) {
        RecordFinishedRepository.insertFinishedRecord(rec);
        deleteFinished.run(rec.id);
      }
    });

    transaction();
  },

  countAll(): number {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM Record");
    const result = stmt.get() as { count: number } | undefined;
    return result?.count ?? 0;
  },

  countAllExceptInTriage(): number {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM Record WHERE status != 'In Triage'");
    const result = stmt.get() as { count: number } | undefined;
    return result?.count ?? 0;
  },

  countByUrgency(urgency: UrgencyClassification): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM Record
      WHERE urgency_classification = ? AND status != 'In Triage'
    `);

    const result = stmt.get(urgency) as { count: number } | undefined;

    return result?.count ?? 0;
  },

  calculateAverageWaitByDefinedUrgency(urgency: UrgencyClassification): number {

    /* IMPLEMENTAR
    * 
    *  O preblema de calcular a média reside no fato de que registros com "triage" 
    *  só existem em uma tabela (Record), enquanto que os outros níveis estão em outra tabela.
    */

    return 0;
  },
};
