import { db } from "../database/db";
import { HospitalRecord } from "../models/hospitalRecord";

const insertBackupStmt = db.prepare(`
  INSERT INTO brokenRecord (
    id, patient_id, arrival_time, triage_call_time,
    urgency_definition_time, urgency_classification, appointment_call_time,
    triage_wait_time, appointment_wait_time, status, broked_at, reason
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?)
`);

export const BrokenRecordRepository = {
  insertBrokedRecord(record: HospitalRecord, reason: string) {
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
      record.status,
      reason
    );
  }
};
