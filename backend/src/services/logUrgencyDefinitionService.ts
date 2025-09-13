import { RecordRepository } from "../repositories/recordRepository";
import { UrgencyClassification } from "../models/hospitalRecord";
import { syncRealtimeDatabase } from "./firebaseSyncService";

export const logUrgencyDefinitionService = {
  define(patient_id: string, classification: UrgencyClassification) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      RecordRepository.insertWithoutData(patient_id);
      RecordRepository.updateUrgencyDefinition(patient_id, classification);

    } else {
      RecordRepository.updateUrgencyDefinition(patient_id, classification);
    }

    syncRealtimeDatabase().catch(console.error);
  }
};
