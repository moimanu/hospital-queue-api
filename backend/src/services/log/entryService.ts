import { db } from "../../database/db";
import { LastDaysRepository } from "../../repositories/lastDaysRepository";
import { RecordRepository } from "../../repositories/recordRepository";
import { updateCache } from "../cache/syncService";

export const entryService = {
  register(patient_id: string) {

    const transaction = db.transaction((pid: string) => {
      RecordRepository.cancelRecord(pid, "Canceled by new record");
      RecordRepository.insertPatient(pid);
      LastDaysRepository.insertOrIncrement();
    });

    transaction(patient_id);

    updateCache().catch(console.error);
  }
};
