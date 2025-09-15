import { RecordRepository } from "../repositories/recordRepository";
import { syncRealtimeDatabase } from "./firebaseSyncService";

export const logTriageCallService = {
  call(patient_id: string) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      RecordRepository.revertLostRecordsForWaitingTriage();
      RecordRepository.insertWithoutData(patient_id);
      RecordRepository.updateTriageCall(patient_id);

    } else {
      RecordRepository.revertLostRecordsForWaitingTriage();
      RecordRepository.updateTriageCall(patient_id);
    }

    syncRealtimeDatabase().catch(console.error);
  }
};