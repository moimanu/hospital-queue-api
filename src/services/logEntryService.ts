import { RecordRepository } from "../repositories/recordRepository";

export const logEntryService = {
  register(patient_id: string) {
    // Cancela registros anteriores do paciente
    RecordRepository.cancelByPatient(patient_id);

    // Cria novo registro
    const date = new Date().toISOString().split("T")[0]!;
    const time = new Date().toTimeString().split(" ")[0]!;

    RecordRepository.insert({
      patient_id,
      admission_date: date,
      arrival_time: time,
      status: "Waiting Triage"
    });
  }
};
