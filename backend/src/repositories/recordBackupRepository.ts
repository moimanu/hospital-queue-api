import { db } from "../database/db";
import { HospitalRecord } from "../models/hospitalRecord";

const insertBackupStmt = db.prepare(`
  INSERT INTO RecordBackup (
    id, patient_id, admission_date, arrival_time, triage_call_time,
    urgency_definition_time, urgency_classification, appointment_call_time,
    triage_wait_time, appointment_wait_time, status, canceled_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

export const insertCanceledRecord = (record: HospitalRecord) => {
  insertBackupStmt.run(
    record.id,
    record.patient_id,
    record.admission_date,
    record.arrival_time,
    record.triage_call_time,
    record.urgency_definition_time,
    record.urgency_classification,
    record.appointment_call_time,
    record.triage_wait_time,
    record.appointment_wait_time,
    record.status
  );
};
