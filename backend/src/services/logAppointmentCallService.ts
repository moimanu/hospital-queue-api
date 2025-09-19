import { RecordRepository } from "../repositories/recordRepository";
import { syncRealtimeDatabase, syncRealtimeDatabaseWithLast10 } from "./firebaseSyncService";

export const logAppointmentCallService = {
  call(patient_id: string) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      RecordRepository.insertWithoutData(patient_id);
      RecordRepository.updateAppointmentCall(patient_id);

    } else {
      RecordRepository.updateAppointmentCall(patient_id);
    }
    
    syncRealtimeDatabaseWithLast10().catch(console.error);
  }
};