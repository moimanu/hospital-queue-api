import { db } from "../database/db";
import { HospitalRecord} from "../models/hospitalRecord";

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
    const stmt = db.prepare(`
      INSERT INTO Record (
        patient_id, admission_date, arrival_time, status
      ) VALUES (?, ?, ?, ?)
    `);
    stmt.run(record.patient_id, record.admission_date, record.arrival_time, record.status);
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

    const insertBackup = db.prepare(`
      INSERT INTO RecordBackup (
        id, patient_id, admission_date, arrival_time, triage_call_time,
        urgency_definition_time, urgency_classification, appointment_call_time,
        triage_wait_time, appointment_wait_time, status, canceled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const deleteCanceled = db.prepare(`
      DELETE FROM Record
      WHERE id = ?
    `);

    const transaction = db.transaction(() => {
      for (const rec of canceledRecords) {
        insertBackup.run(
          rec.id, rec.patient_id, rec.admission_date, rec.arrival_time,
          rec.triage_call_time, rec.urgency_definition_time, rec.urgency_classification,
          rec.appointment_call_time, rec.triage_wait_time, rec.appointment_wait_time,
          rec.status
        );

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

    const insertBackup = db.prepare(`
      INSERT INTO RecordFinishedBackup (
        id, patient_id, admission_date, arrival_time, triage_call_time,
        urgency_definition_time, urgency_classification, appointment_call_time,
        triage_wait_time, appointment_wait_time, status, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const deleteFinished = db.prepare(`
      DELETE FROM Record
      WHERE id = ?
    `);

    const transaction = db.transaction(() => {
      for (const rec of finishedRecords) {
        insertBackup.run(
          rec.id, rec.patient_id, rec.admission_date, rec.arrival_time,
          rec.triage_call_time, rec.urgency_definition_time, rec.urgency_classification,
          rec.appointment_call_time, rec.triage_wait_time, rec.appointment_wait_time,
          rec.status
        );
        deleteFinished.run(rec.id);
      }
    });

    transaction();
  }
};
