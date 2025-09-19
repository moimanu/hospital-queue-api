import admin from "../firebase/firebaseAdmin";
import { RecordRepository } from "../repositories/recordRepository";
import { RecordFinishedRepository } from "../repositories/recordFinishedRepository";
import { LastDaysRepository } from "../repositories/lastDaysRepository";
import { UrgencyClassification } from "../models/hospitalRecord";
import { getLocalWeekday, getLocalISODateTime } from "../helpers/dateHelper";

// Lista de todos os níveis de urgência considerados
const urgencyLevels: UrgencyClassification[] = [
  "triage", "red", "orange", "yellow", "green", "blue"
];

const db = admin.database();
const dbRef = db.ref("stats");

// -------- Funções de sincronização individuais -------- //

// Atualiza o nó `current_state`
async function syncCurrentState() {
  const currentState: Record<string, { count: number; avg_time: number }> = {};
  const n = 5; // limite de registros para média

  for (const level of urgencyLevels) {
    const count = RecordRepository.countByUrgency(level);

    let avg = 0;
    if (level === 'triage') {
      avg = RecordRepository.calculateAverageTriageWaitFromBothTables(n);
    } else {
      avg = RecordFinishedRepository.calculateAverageWaitByClassificationFinished(level, n);
    }

    // Garantir que avg seja número e não NaN
    if (isNaN(avg) || avg === null || avg === undefined) {
      avg = 0;
    }

    currentState[level] = { count, avg_time: avg };
  }

  await dbRef.child("current_state").set(currentState);
}

// Atualiza o nó `in_triage`
async function syncInTriage() {
  const count = RecordRepository.countByInTriage();
  await dbRef.child("in_triage").set(count);
}

// Atualiza o nó `last_days` usando apenas dados locais
async function syncLastDays() {
  const lastDaysFromDb = LastDaysRepository.getLastSevenDays();

  const firebaseFormat: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  };

  for (const day of lastDaysFromDb) {
    const weekday = getLocalWeekday(day.date);
    firebaseFormat[weekday] = day.quantity;
  }

  await dbRef.child("last_days").set(firebaseFormat);
}

// Atualiza o nó `total_people`
async function syncTotalPeople() {
  const totalPeople = RecordRepository.countAll();
  await dbRef.child("total_people").set(totalPeople);
}

// Atualiza o nó `last_update`
async function syncLastUpdate() {
  const isoNow = getLocalISODateTime();
  await dbRef.child("last_update").set(isoNow);
}

async function syncLast10Appointments() {
  const now = getLocalISODateTime();

  const ref = dbRef.child("last10Appointments");
  const snapshot = await ref.once("value");
  const current = snapshot.val() as { called_at: string }[] | null;

  let updated: { called_at: string }[] = current ? Object.values(current) : [];
  updated.push({ called_at: now });

  if (updated.length > 10) {
    updated = updated.slice(updated.length - 10);
  }

  await ref.set(updated);
}

// -------- Função principal que chama as outras -------- //

export async function syncRealtimeDatabase() {
  try {
    await Promise.all([
      syncCurrentState(),
      syncInTriage(),
      syncLastDays(),
      syncTotalPeople(),
      syncLastUpdate()
    ]);
  } catch (error) {
    console.error("Failed to update Firebase Realtime Database:", error);
  }
}

// -------- Função principal extendida -------- //
export async function syncRealtimeDatabaseWithLast10() {
  try {
    await Promise.all([
      syncCurrentState(),
      syncInTriage(),
      syncLastDays(),
      syncTotalPeople(),
      syncLastUpdate(),
      syncLast10Appointments()
    ]);
  } catch (error) {
    console.error("Failed to update Firebase Realtime Database (with last10Appointments):", error);
  }
}