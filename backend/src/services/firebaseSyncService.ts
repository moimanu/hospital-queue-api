import admin from "../firebase/firebaseAdmin";
import { RecordRepository } from "../repositories/recordRepository";
import { UrgencyClassification } from "../models/hospitalRecord";

// Lista de todos os níveis de urgência considerados
const urgencyLevels: UrgencyClassification[] = [
  "triage", "red", "orange", "yellow", "green", "blue"
];

// Função responsável por sincronizar as estatísticas locais com o Firebase Realtime Database
export async function syncRealtimeDatabase(incrementDay = false) {
  const db = admin.database();
  const dbRef = db.ref("stats");

  const snapshot = await dbRef.once("value");
  const data = snapshot.exists() ? snapshot.val() : {};

  const now = new Date();
  const isoNow = now.toISOString();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });

  const totalPeople = RecordRepository.countAllExceptInTriage();

  const currentState: Record<string, { count: number; avg_time: number }> = {};
  for (const level of urgencyLevels) {
    const count = RecordRepository.countByUrgency(level);
    const avg = RecordRepository.calculateAverageWaitByUrgency(level);
    currentState[level] = { count, avg_time: avg };
  }

  const lastDays = data.last_days || {
    Sunday: 0, Monday: 0, Tuesday: 0,
    Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };

  // Incrementa só se explicitamente solicitado
  if (incrementDay) {
    lastDays[weekday] = (lastDays[weekday] || 0) + 1;
  }

  const updatedData = {
    last_update: isoNow,
    total_people: totalPeople,
    current_state: currentState,
    last_days: lastDays
  };

  try {
    await dbRef.update(updatedData);
  } catch (error) {
    console.error("Failed to update Firebase Realtime Database:", error);
  }
}
