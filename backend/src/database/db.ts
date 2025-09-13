import Database, { Database as BetterSqliteDatabase } from "better-sqlite3";

// Cria conexão
const db: BetterSqliteDatabase = new Database("database.db");

// Cria tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS Record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    arrival_time TEXT,
    triage_call_time TEXT,
    urgency_definition_time TEXT,
    urgency_classification TEXT,
    appointment_call_time TEXT,
    triage_wait_time TEXT,
    appointment_wait_time TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS RecordCanceled (
    id INTEGER PRIMARY KEY,
    patient_id TEXT NOT NULL,
    arrival_time TEXT,
    triage_call_time TEXT,
    urgency_definition_time TEXT,
    urgency_classification TEXT,
    appointment_call_time TEXT,
    triage_wait_time TEXT,
    appointment_wait_time TEXT,
    status TEXT,
    canceled_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS RecordFinished (
    id INTEGER PRIMARY KEY,
    patient_id TEXT NOT NULL,
    arrival_time TEXT,
    triage_call_time TEXT,
    urgency_definition_time TEXT,
    urgency_classification TEXT,
    appointment_call_time TEXT,
    triage_wait_time TEXT,
    appointment_wait_time TEXT,
    status TEXT NOT NULL,
    finished_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS LastDays (
    date TEXT PRIMARY KEY,
    quantity INTEGER NOT NULL
  );
`);

export { db };
