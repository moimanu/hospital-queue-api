import { RecordRepository } from "../../repositories/recordRepository";
import { updateCache } from "../cache/syncService";

export const triageCallService = {
  call(patient_id: string) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      RecordRepository.alertLostRecordsForWaitingTriage(patient_id);
      RecordRepository.insertWithoutData(patient_id);
      RecordRepository.updateTriageCall(patient_id);

    } else {
      RecordRepository.alertLostRecordsForWaitingTriage(patient_id);
      RecordRepository.updateTriageCall(patient_id);
    }

    updateCache().catch(console.error);
  }
};