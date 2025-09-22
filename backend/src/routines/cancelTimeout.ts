import { RecordRepository } from "../repositories/recordRepository";
import { updateCache } from "../services/cache/syncService";

const TIMEOUT_SECONDS = Number(process.env.RECORD_TIMEOUT_SECONDS) || 21600;
const INTERVAL_MS = Number(process.env.CANCEL_INTERVAL_MS) || 5 * 60 * 1000;

export function startCancelTimeoutRoutine() {
  async function cancelExpiredRecords() {
    const now = Date.now();
    let anyCanceled = false;

    const activeRecords = RecordRepository.selectAll();

    activeRecords.forEach(record => {
      const lastTime =
        record.triage_call_time ??
        record.urgency_definition_time ??
        record.arrival_time;

      if (!lastTime) return;

      const lastTimestamp = new Date(lastTime).getTime();

      if ((now - lastTimestamp) / 1000 > TIMEOUT_SECONDS) {
        RecordRepository.cancelRecord(record.patient_id, "Canceled by timeout");
        console.log(`\nRegistro ${record.patient_id} cancelado por timeout.`);
        anyCanceled = true;
      }
    });

    if (anyCanceled) {
      await updateCache().catch(console.error);
    }
  }

  // Executa a cada 5 minutos
  setInterval(cancelExpiredRecords, INTERVAL_MS);

  // Executa uma vez ao iniciar
  cancelExpiredRecords();
}
