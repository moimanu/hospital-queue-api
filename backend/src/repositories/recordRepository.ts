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

    moveCanceledToBackup(patient_id);
  },

  insertPatient(patient_id: string) {
    db.prepare(`
      INSERT INTO Record (
        patient_id, arrival_time, urgency_classification, status
      ) VALUES (?, datetime('now', 'localtime'), 'triage', 'Waiting Triage')
    `).run(patient_id);
  },

  insertWithoutData(patient_id: string) { 
    db.prepare(`
      INSERT INTO Record (
        patient_id
      ) VALUES (?)
    `).run(patient_id);
  },

  findLatestByPatient(patient_id: string): HospitalRecord | undefined {
    const stmt = db.prepare(`
      SELECT * FROM Record
      WHERE patient_id = ? AND status IN ('Waiting Triage', 'In Triage', 'Waiting Appointment')
      ORDER BY id DESC LIMIT 1
    `);
    return stmt.get(patient_id) as HospitalRecord | undefined;
  },

  updateTriageCall(patient_id: string) {
    db.prepare(`
      UPDATE Record
      SET 
        triage_call_time = datetime('now', 'localtime'),
        triage_wait_time = ROUND(
          (julianday('now', 'localtime') - julianday(arrival_time)) * 24 * 60 * 60
        ),
        urgency_classification = 'triage',
        status = 'In Triage'
      WHERE patient_id = ? AND triage_call_time IS NULL
    `).run(patient_id);
  },

  updateUrgencyDefinition(patient_id: string, classification: string) {
    db.prepare(`
      UPDATE Record
      SET urgency_definition_time = datetime('now', 'localtime'), urgency_classification = ?, status = 'Waiting Appointment'
      WHERE patient_id = ? AND urgency_definition_time IS NULL
    `).run(classification, patient_id);
  },

  updateAppointmentCall(patient_id: string) {
    db.prepare(`
      UPDATE Record
      SET 
        appointment_call_time = datetime('now', 'localtime'),
        appointment_wait_time = ROUND(
          (julianday('now', 'localtime') - julianday(urgency_definition_time)) * 24 * 60 * 60
        ),
        status = 'Finished'
      WHERE patient_id = ? AND appointment_call_time IS NULL
    `).run(patient_id);

    moveFinishedToBackup(patient_id);
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

  calculateAverageTriageWaitFromBothTables(n: number): number {
    const limit = n * 2;

    const recordRows = db.prepare(`
      SELECT triage_wait_time, arrival_time
      FROM Record
      WHERE triage_wait_time IS NOT NULL
      ORDER BY arrival_time DESC
      LIMIT ?
    `).all(limit) as { triage_wait_time: number; arrival_time: string }[];

    const finishedRows = db.prepare(`
      SELECT triage_wait_time, arrival_time
      FROM RecordFinished
      WHERE triage_wait_time IS NOT NULL
      ORDER BY arrival_time DESC
      LIMIT ?
    `).all(limit) as { triage_wait_time: number; arrival_time: string }[];

    const allRows = [...recordRows, ...finishedRows];

    allRows.sort((a, b) => new Date(b.arrival_time).getTime() - new Date(a.arrival_time).getTime());

    const topN = allRows.slice(0, n);
    if (topN.length === 0) return 0;

    const total = topN.reduce((sum, r) => {
      const val = Number(r.triage_wait_time);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const average = total / topN.length;
    return average;
  }
};

function moveCanceledToBackup(patient_id: string) {
  const canceledRecords = db.prepare(`
    SELECT * FROM Record
    WHERE patient_id = ? AND status = 'Canceled'
  `).all(patient_id) as HospitalRecord[];

  const deleteCanceled = db.prepare(`DELETE FROM Record WHERE id = ?`);

  const transaction = db.transaction(() => {
    for (const rec of canceledRecords) {
      RecordCanceledRepository.insertCanceledRecord(rec);
      deleteCanceled.run(rec.id);
    }
  });

  transaction();
}

function moveFinishedToBackup(patient_id: string) {
  const finishedRecords = db.prepare(`
    SELECT * FROM Record
    WHERE patient_id = ? AND status = 'Finished'
  `).all(patient_id) as HospitalRecord[];

  const deleteFinished = db.prepare(`DELETE FROM Record WHERE id = ?`);

  const transaction = db.transaction(() => {
    for (const rec of finishedRecords) {
      RecordFinishedRepository.insertFinishedRecord(rec);
      deleteFinished.run(rec.id);
    }
  });

  transaction();
}