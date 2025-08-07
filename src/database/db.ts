import Database, { Database as BetterSqliteDatabase } from "better-sqlite3";

// Cria conexão
const db: BetterSqliteDatabase = new Database("database.db");

// Cria tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS Record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    admission_date TEXT,
    arrival_time TEXT,
    triage_call_time TEXT,
    urgency_definition_time TEXT,
    urgency_classification TEXT,
    appointment_call_time TEXT,
    triage_wait_time TEXT,
    appointment_wait_time TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS RecordBackup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    admission_date DATE,
    arrival_time TIME,
    triage_call_time TIME,
    urgency_definition_time TIME,
    urgency_classification TEXT,
    appointment_call_time TIME,
    triage_wait_time TEXT,
    appointment_wait_time TEXT,
    status TEXT,
    canceled_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE RecordFinishedBackup (
    id INTEGER PRIMARY KEY,
    patient_id TEXT NOT NULL,
    admission_date TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    triage_call_time TEXT,
    urgency_definition_time TEXT,
    urgency_classification TEXT,
    appointment_call_time TEXT,
    triage_wait_time TEXT,
    appointment_wait_time TEXT,
    status TEXT NOT NULL,
    finished_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export { db };
