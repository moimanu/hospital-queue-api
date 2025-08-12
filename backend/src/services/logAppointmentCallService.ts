import { RecordRepository } from "../repositories/recordRepository";
import { syncRealtimeDatabase } from "./firebaseSyncService";

export const logAppointmentCallService = {
  call(patient_id: string) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      throw { status: 404, message: "Patient not found." };
    }

    if (record.status === "Waiting Triage") {
      throw { status: 400, message: "Patient has not been called for triage yet." };
    }

    if (record.status === "In Triage") {
      throw { status: 400, message: "Patient is still in triage." };
    }

    if (!record.urgency_definition_time) {
        throw { status: 400, message: "Urgency definition time is missing for this patient." };
    }

    RecordRepository.updateAppointmentCall(patient_id);
    syncRealtimeDatabase().catch(console.error);
  }
};