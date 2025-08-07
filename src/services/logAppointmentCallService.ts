import { RecordRepository } from "../repositories/recordRepository";
import { getCurrentTime, calculateWaitTime } from "../helpers/time";
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

    const nowTime = getCurrentTime();
    if (!record.urgency_definition_time) {
        throw { status: 400, message: "Urgency definition time is missing for this patient." };
    }
    const appointmentWaitTime = calculateWaitTime(record.admission_date, record.urgency_definition_time);

    RecordRepository.updateAppointmentCall(patient_id, nowTime, appointmentWaitTime);
    syncRealtimeDatabase().catch(console.error);
  }
};