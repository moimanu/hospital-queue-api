import admin from "../firebase/firebaseAdmin";
import { RecordRepository } from "../repositories/recordRepository";
import { UrgencyClassification } from "../models/hospitalRecord";

// Lista de todos os níveis de urgência considerados
const urgencyLevels: UrgencyClassification[] = [
  "triage", "red", "orange", "yellow", "green", "blue"
];

// Função responsável por sincronizar as estatísticas locais com o Firebase Realtime Database
export async function syncRealtimeDatabase() {
  const db = admin.database(); // Obtém a instância do Realtime Database
  const dbRef = db.ref("stats"); // Cria referência para o nó "stats"

  // Lê o estado atual salvo no nó "stats"
  const snapshot = await dbRef.once("value");
  const data = snapshot.exists() ? snapshot.val() : {}; // Se houver dados, usa-os; caso contrário, inicia vazio

  const now = new Date(); // Obtém o momento atual
  const isoNow = now.toISOString(); // Formato ISO para facilitar a leitura e ordenação
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" }); // Nome do dia da semana

  // Conta todas as pessoas, exceto aquelas com status "in_triage"
  const totalPeople = RecordRepository.countAllExceptInTriage();

  // Calcula a quantidade e tempo médio de espera para cada nível de urgência
  const currentState: Record<string, { count: number; avg_time: number }> = {};
  for (const level of urgencyLevels) {
    const stats = RecordRepository.calculateAverageWait(level); // Retorna { count, avg }
    currentState[level] = {
      count: stats.count,
      avg_time: stats.avg
    };
  }

  // Atualiza a contagem de registros por dia da semana
  const lastDays = data.last_days || {
    Sunday: 0, Monday: 0, Tuesday: 0,
    Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };
  lastDays[weekday] = (lastDays[weekday] || 0) + 1;

  // Monta os dados atualizados para envio ao Realtime Database
  const updatedData = {
    last_update: isoNow,          // Data/hora da última atualização
    total_people: totalPeople,    // Total de pessoas atualmente no sistema
    current_state: currentState,  // Estatísticas por nível de urgência
    last_days: lastDays           // Contagem de atendimentos por dia da semana
  };

  // Envia os dados atualizados para o Firebase
  try {
    await dbRef.update(updatedData);
  } catch (error) {
    console.error("Failed to update Firebase Realtime Database:", error); // Loga erro, se ocorrer
  }
}
