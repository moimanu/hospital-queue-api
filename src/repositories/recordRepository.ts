import { db } from "../database/db";
import { HospitalRecord, RecordStatus } from "../models/hospitalRecord";

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
  },

  insert(record: HospitalRecord) {
    const stmt = db.prepare(`
      INSERT INTO Record (
        patient_id, admission_date, arrival_time, status
      ) VALUES (?, ?, ?, ?)
    `);
    stmt.run(record.patient_id, record.admission_date, record.arrival_time, record.status);
  }
};
