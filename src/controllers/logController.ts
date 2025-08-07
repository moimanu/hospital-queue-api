import { Request, Response } from "express";
import { handleLogAction } from "../helpers/handleLogAction";
import { logEntryService } from "../services/logEntryService";
import { logTriageCallService } from "../services/logTriageCallService";
import { logUrgencyDefinitionService } from "../services/logUrgencyDefinitionService";
import { logAppointmentCallService } from "../services/logAppointmentCallService";

export const logController = {
  entry(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id"], ({ patient_id }) => {
      logEntryService.register(patient_id);
    }, "Entry registered successfully.");
  },

  triageCall(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id"], ({ patient_id }) => {
      logTriageCallService.call(patient_id);
    }, "Triage called successfully.");
  },

  urgencyDefinition(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id", "classification"], ({ patient_id, classification }) => {
      logUrgencyDefinitionService.define(patient_id, classification);
    }, "Urgency defined successfully.");
  },

  appointmentCall(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id"], ({ patient_id }) => {
      logAppointmentCallService.call(patient_id);
    }, "Appointment call registered successfully.");
  }
};
