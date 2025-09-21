import { cacheService } from "./cacheService";
import { RecordRepository } from "../../repositories/recordRepository";
import { RecordFinishedRepository } from "../../repositories/recordFinishedRepository";
import { LastDaysRepository } from "../../repositories/lastDaysRepository";
import { UrgencyClassification } from "../../models/hospitalRecord";
import { getLocalWeekday, getLocalISODateTime } from "../../helpers/dateHelper";

// Tipos
const urgencyLevels: UrgencyClassification[] = ["triage","red","orange","yellow","green","blue"];
type Weekday = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

/**
 * Atualiza o cache em memória
 * @param includeLast10 Se true, também atualiza os últimos 10 atendimentos
 */
export async function updateCache(includeLast10 = false) {
  // --- Estatísticas básicas ---
  const current_state: Record<UrgencyClassification, { count:number; avg_time:number }> = {
    triage: { count: 0, avg_time: 0 },
    red: { count: 0, avg_time: 0 },
    orange: { count: 0, avg_time: 0 },
    yellow: { count: 0, avg_time: 0 },
    green: { count: 0, avg_time: 0 },
    blue: { count: 0, avg_time: 0 }
  };

  for(const level of urgencyLevels){
    const count = RecordRepository.countByUrgency(level);
    let avg = (level==='triage') 
      ? RecordRepository.calculateAverageTriageWaitFromBothTables(5)
      : RecordFinishedRepository.calculateAverageWaitByClassificationFinished(level,5);

    if(isNaN(avg) || avg == null) avg = 0;
    current_state[level] = { count, avg_time: avg };
  }

  const in_triage = RecordRepository.countByInTriage();
  const total_people = RecordRepository.countAll();

  const last_days = LastDaysRepository.getLastSevenDays().reduce((acc, day) => {
    const weekday = getLocalWeekday(day.date) as Weekday;
    acc[weekday] = day.quantity;
    return acc;
  }, {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  } as Record<Weekday, number>);

  const last_update = getLocalISODateTime();

  // --- Atualiza cache básico ---
  const partialUpdate: any = { current_state, in_triage, last_days, total_people, last_update };

  // --- Atualiza últimos 10 atendimentos se necessário ---
  if(includeLast10) {
    const now = getLocalISODateTime();
    const current = cacheService.getCache().last10Appointments || [];
    let updated = [...current, { called_at: now }];
    if(updated.length > 10) updated = updated.slice(updated.length - 10);
    partialUpdate.last10Appointments = updated;
  }

  // --- Atualiza cache e dispara SSE ---
  cacheService.updateCache(partialUpdate);
}
