import admin from "../firebase/firebaseAdmin";
import { RecordRepository } from "../repositories/recordRepository";
import { LastDaysRepository } from "../repositories/lastDaysRepository";
import { UrgencyClassification } from "../models/hospitalRecord";
import { getLocalWeekday } from "../helpers/dateHelper";

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

  for (const level of urgencyLevels) {
    const count = RecordRepository.countByUrgency(level);
    const avg = RecordRepository.calculateAverageWaitByDefinedUrgency(level);
    currentState[level] = { count, avg_time: avg };
  }

  await dbRef.child("current_state").set(currentState);
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
  const totalPeople = RecordRepository.countAllExceptInTriage();
  await dbRef.child("total_people").set(totalPeople);
}

// Atualiza o nó `last_update`
async function syncLastUpdate() {
  const isoNow = new Date().toISOString();
  await dbRef.child("last_update").set(isoNow);
}

// -------- Função principal que chama as outras -------- //

export async function syncRealtimeDatabase() {
  try {
    await Promise.all([
      syncCurrentState(),
      syncLastDays(),
      syncTotalPeople(),
      syncLastUpdate()
    ]);
  } catch (error) {
    console.error("Failed to update Firebase Realtime Database:", error);
  }
}
