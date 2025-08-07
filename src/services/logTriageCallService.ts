import { RecordRepository } from "../repositories/recordRepository";
import { getCurrentTime, calculateWaitTime } from "../helpers/time";

export const logTriageCallService = {
  call(patient_id: string) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      throw { status: 404, message: "Patient not found." };
    }

    if (record.status === "In Triage") {
      throw { status: 400, message: "Patient has already been called for triage." };
    }

    if (record.status === "Waiting Appointment") {
      throw { status: 400, message: "Patient has already passed through triage." };
    }

    const nowTime = getCurrentTime();
    const triageWaitTime = calculateWaitTime(record.admission_date, record.arrival_time);

    RecordRepository.updateTriageCall(patient_id, nowTime, triageWaitTime);
  }
};