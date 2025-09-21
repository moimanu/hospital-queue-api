import { RecordRepository } from "../../repositories/recordRepository";
import { updateCache } from "../cache/syncService";

export const appointmentCallService = {
  call(patient_id: string) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      RecordRepository.insertWithoutData(patient_id);
      RecordRepository.updateAppointmentCall(patient_id);

    } else {
      RecordRepository.updateAppointmentCall(patient_id);
    }
    
    updateCache(true).catch(console.error);
  }
};