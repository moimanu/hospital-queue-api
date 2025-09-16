export type UrgencyClassification = 
  | "triage" 
  | "red" 
  | "orange" 
  | "yellow" 
  | "green" 
  | "blue";

export type RecordStatus = 
  | "Waiting Triage"
  | "In Triage"
  | "In Triage (superimposed)"
  | "Waiting Appointment"
  | "Finished"

export interface HospitalRecord {
  id?: number;
  patient_id: string;
  arrival_time: string;
  triage_call_time?: string;
  urgency_definition_time?: string;
  urgency_classification?: UrgencyClassification;
  appointment_call_time?: string;
  triage_wait_time?: string; // SEGUNDOS
  appointment_wait_time?: string; // SEGUNDOS
  status: RecordStatus;
}
