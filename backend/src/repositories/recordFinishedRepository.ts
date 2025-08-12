import { db } from "../database/db";
import { HospitalRecord } from "../models/hospitalRecord";

const insertBackupStmt = db.prepare(`
  INSERT INTO RecordFinished (
    id, patient_id, arrival_time, triage_call_time,
    urgency_definition_time, urgency_classification, appointment_call_time,
    triage_wait_time, appointment_wait_time, status, finished_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
`);

export const RecordFinishedRepository = {
  insertFinishedRecord(record: HospitalRecord) {
    insertBackupStmt.run(
      record.id,
      record.patient_id,
      record.arrival_time,
      record.triage_call_time,
      record.urgency_definition_time,
      record.urgency_classification,
      record.appointment_call_time,
      record.triage_wait_time,
      record.appointment_wait_time,
      record.status
    );
  },

  calculateAverageWaitByClassificationFinished(urgency: string, n: number): number {
    const stmt = db.prepare(`
      SELECT AVG(appointment_wait_time) as avg_wait
      FROM (
        SELECT appointment_wait_time
        FROM RecordFinished
        WHERE urgency_classification = ? AND appointment_wait_time IS NOT NULL
        ORDER BY arrival_time DESC
        LIMIT ?
      )
    `);

    const result = stmt.get(urgency, n) as { avg_wait: number | null };

    return result.avg_wait ?? 0;
  }
};
