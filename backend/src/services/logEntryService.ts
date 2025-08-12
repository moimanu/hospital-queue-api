import { RecordRepository } from "../repositories/recordRepository";
import { syncRealtimeDatabase } from "./firebaseSyncService";

export const logEntryService = {
  register(patient_id: string) {
    // Cancela registros anteriores do paciente
    RecordRepository.cancelByPatient(patient_id);

    RecordRepository.insert(patient_id);

    syncRealtimeDatabase().catch(console.error);
  }
};
