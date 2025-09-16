import { db } from "../database/db";
import { HospitalRecord, UrgencyClassification } from "../models/hospitalRecord";
import { BrokenRecordRepository } from "./brokenRecordRepository";
import { RecordFinishedRepository } from "./recordFinishedRepository";

export const RecordRepository = {

  // Select

  selectAll(): HospitalRecord[] {
    const stmt = db.prepare(`
      SELECT * FROM Record
    `);
    return stmt.all() as HospitalRecord[];
  },

  selectAllByPatientId(patient_id: string): HospitalRecord[] {
    return db.prepare(`
      SELECT * FROM Record 
      WHERE patient_id = ?
    `).all(patient_id) as HospitalRecord[];
  },

  selectAllFinishedByPatientId(patient_id: string): HospitalRecord[] {
    return db.prepare(`
      SELECT * FROM Record 
      WHERE patient_id = ? AND status = 'Finished'
    `).all(patient_id) as HospitalRecord[];
  },

  findActiveByPatient(patient_id: string): HospitalRecord[] {
    return db.prepare(`
      SELECT * FROM Record
      WHERE patient_id = ? 
        AND status IN ('Waiting Triage', 'In Triage', 'Waiting Appointment')
    `).all(patient_id) as HospitalRecord[];
  },

  findLatestByPatient(patient_id: string): HospitalRecord | undefined {
    return db.prepare(`
      SELECT * FROM Record
      WHERE patient_id = ? 
        AND status IN ('Waiting Triage', 'In Triage', 'Waiting Appointment')
      ORDER BY id DESC 
      LIMIT 1
    `).get(patient_id) as HospitalRecord | undefined;
  },

  countAll(): number {
    const result = db.prepare(`
      SELECT COUNT(*) as count 
      FROM Record
    `).get() as { count: number } | undefined;
    return result?.count ?? 0;
  },

  countByUrgency(urgency: UrgencyClassification): number {
    const result = db.prepare(`
      SELECT COUNT(*) as count
      FROM Record
      WHERE urgency_classification = ? 
        AND status != 'In Triage'
    `).get(urgency) as { count: number } | undefined;
    return result?.count ?? 0;
  },

  countByInTriage(): number {
    const row = db.prepare(`
      SELECT COUNT(*) AS count
      FROM Record
      WHERE status = 'In Triage'
    `).get() as { count: number };

    return row?.count ?? 0;
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

    const allRows = [...recordRows, ...finishedRows].sort(
      (a, b) => new Date(b.arrival_time).getTime() - new Date(a.arrival_time).getTime()
    );

    const topN = allRows.slice(0, n);
    if (topN.length === 0) return 0;

    const total = topN.reduce((sum, r) => sum + (Number(r.triage_wait_time) || 0), 0);
    return total / topN.length;
  },

  // Insert

  insertPatient(patient_id: string) {
    db.prepare(`
      INSERT INTO Record (
        patient_id, arrival_time, urgency_classification, status
      ) VALUES (?, datetime('now', 'localtime'), 'triage', 'Waiting Triage')
    `).run(patient_id);
  },

  insertWithoutData(patient_id: string) {
    db.prepare(`
      INSERT INTO Record (patient_id) VALUES (?)
    `).run(patient_id);
  },

  // Update

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
      WHERE patient_id = ? 
        AND triage_call_time IS NULL
    `).run(patient_id);
  },

  updateUrgencyDefinition(patient_id: string, classification: string) {
    db.prepare(`
      UPDATE Record
      SET 
        urgency_definition_time = datetime('now', 'localtime'), 
        urgency_classification = ?, 
        status = 'Waiting Appointment'
      WHERE patient_id = ? 
        AND urgency_definition_time IS NULL
    `).run(classification, patient_id);
  },

  updateAppointmentCall(patient_id: string) {
    db.transaction(() => { 
      db.prepare(`
        UPDATE Record
        SET 
          appointment_call_time = datetime('now', 'localtime'),
          appointment_wait_time = ROUND(
            (julianday('now', 'localtime') - julianday(urgency_definition_time)) * 24 * 60 * 60
          ),
          status = 'Finished'
        WHERE patient_id = ? 
          AND appointment_call_time IS NULL
      `).run(patient_id);

      moveFinishedToBackup(patient_id);
    })(); 
  },

  revertLostRecordsForWaitingTriage () {
    db.prepare(`
      UPDATE Record
      SET 
        status = 'In Triage (superimposed)'
      WHERE status = 'In Triage'
    `).run();
  },

  // Cancelamentos

  cancelRecord(patient_id: string, reason: string) {
    const brokedRecords = RecordRepository.selectAllByPatientId(patient_id);

    db.transaction(() => {
      for (const rec of brokedRecords) {
        BrokenRecordRepository.insertBrokedRecord(rec, reason);
        RecordRepository.deleteRecord(rec.patient_id);
      }
    })();
  },

  // Deletes

  deleteRecord(patient_id: string) {
    db.prepare(`DELETE FROM Record WHERE patient_id = ?`).run(patient_id);;
  },
};

// Funções auxiliares internas

function moveFinishedToBackup(patient_id: string) { 
  const finishedRecords = RecordRepository.selectAllFinishedByPatientId(patient_id);

  db.transaction(() => { 
    for (const rec of finishedRecords) { 
      if (isValidRecord(rec)) {
        RecordFinishedRepository.insertFinishedRecord(rec); 
      } else {
        BrokenRecordRepository.insertBrokedRecord(rec, "Broken by inconsistencies");
      }
      RecordRepository.deleteRecord(rec.patient_id); 
    } 
  })(); 
}

function isValidRecord(rec: {
  arrival_time: string;
  triage_call_time?: string;
  urgency_definition_time?: string;
  appointment_call_time?: string;
  urgency_classification?: string;
}): boolean {
  const a = new Date(rec.arrival_time).getTime();
  const t = rec.triage_call_time ? new Date(rec.triage_call_time).getTime() : 0;
  const u = rec.urgency_definition_time ? new Date(rec.urgency_definition_time).getTime() : 0;
  const ap = rec.appointment_call_time ? new Date(rec.appointment_call_time).getTime() : 0;

  if (!a || !t || !u || !ap) return false;

  if (!(["triage", "red", "orange", "yellow", "green", "blue"] as UrgencyClassification[])
        .includes(rec.urgency_classification as UrgencyClassification)) {
    return false;
  }

  return a <= t && t <= u && u <= ap;
}
