import { RecordRepository } from "../repositories/recordRepository";
import { syncRealtimeDatabase } from "./firebaseSyncService";
import { getLocalDate, getLocalTime } from "../helpers/dateHelper";

export const logEntryService = {
  register(patient_id: string) {
    // Cancela registros anteriores do paciente
    RecordRepository.cancelByPatient(patient_id);

    // Cria novo registro com fuso correto
    const date = getLocalDate();
    const time = getLocalTime();

    RecordRepository.insert({
      patient_id,
      admission_date: date,
      arrival_time: time,
      status: "Waiting Triage"
    });

    syncRealtimeDatabase().catch(console.error);
  }
};
