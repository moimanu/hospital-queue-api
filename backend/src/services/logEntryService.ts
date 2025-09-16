import { db } from "../database/db";
import { LastDaysRepository } from "../repositories/lastDaysRepository";
import { RecordRepository } from "../repositories/recordRepository";
import { syncRealtimeDatabase } from "./firebaseSyncService";

export const logEntryService = {
  register(patient_id: string) {

    const transaction = db.transaction((pid: string) => {
      RecordRepository.cancelRecord(pid, "Canceled by new record");
      RecordRepository.insertPatient(pid);
      LastDaysRepository.insertOrIncrement();
    });

    transaction(patient_id);

    syncRealtimeDatabase().catch(console.error);
  }
};
