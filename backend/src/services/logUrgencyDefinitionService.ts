import { RecordRepository } from "../repositories/recordRepository";
import { UrgencyClassification } from "../models/hospitalRecord";
import { syncRealtimeDatabase } from "./firebaseSyncService";

export const logUrgencyDefinitionService = {
  define(patient_id: string, classification: UrgencyClassification) {
    const record = RecordRepository.findLatestByPatient(patient_id);

    if (!record) {
      throw { status: 404, message: "Patient not found." };
    }

    if (record.status === "Waiting Triage") {
      throw { status: 400, message: "Patient is still waiting for triage." };
    }

    if (record.status === "Waiting Appointment") {
      throw { status: 400, message: "Patient already passed triage." };
    }

    const now = new Date();
    const time = now.toTimeString().split(" ")[0]!;

    RecordRepository.updateUrgencyDefinition(patient_id, time, classification);
    syncRealtimeDatabase().catch(console.error);
  }
};
