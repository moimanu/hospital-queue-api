import { Request, Response } from "express";
import { logEntryService } from "../services/logEntryService";
import { logTriageCallService } from "../services/logTriageCallService";
import { logUrgencyDefinitionService } from "../services/logUrgencyDefinitionService";
import { logAppointmentCallService } from "../services/logAppointmentCallService";

export const logController = {
  
  // Entrance to the hospital
  entry(req: Request, res: Response) {
    const { patient_id } = req.body;

    if (!patient_id) { 
      return res.status(400).json({ error: "Missing patient_id" });
    }

    try {
      logEntryService.register(patient_id);
      return res.status(201).json({ message: "Entry registered successfully." });
    } catch (err) { return res.status(500).json({ error: "Internal server error." });}
  },

  // Call to attend screening
  triageCall(req: Request, res: Response) {
    const { patient_id } = req.body;

    if (!patient_id) {
      return res.status(400).json({ error: "Missing patient_id" });
    }

    try {
      logTriageCallService.call(patient_id);
      return res.status(200).json({ message: "Triage called successfully." });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Internal server error." });
    }
  },

  // Defining patient urgency after triage
  urgencyDefinition(req: Request, res: Response) {
    const { patient_id, classification } = req.body;

    if (!patient_id || !classification) {
      return res.status(400).json({ error: "Missing patient_id or classification" });
    }

    try {
      logUrgencyDefinitionService.define(patient_id, classification);
      return res.status(200).json({ message: "Urgency defined successfully." });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Internal server error." });
    }
  },

  // Call the patient for care
  appointmentCall(req: Request, res: Response) {
    const { patient_id } = req.body;

    if (!patient_id) {
      return res.status(400).json({ error: "Missing patient_id" });
    }

    try {
      logAppointmentCallService.call(patient_id);
      return res.status(200).json({ message: "Appointment call registered successfully." });
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err.message || "Internal server error." });
    }
  }
};
