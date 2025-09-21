import { Request, Response } from "express";
import { handleLogAction } from "../helpers/handleLogAction";
import { entryService } from "../services/log/entryService";
import { triageCallService } from "../services/log/triageCallService";
import { urgencyDefinitionService } from "../services/log/urgencyDefinitionService";
import { appointmentCallService } from "../services/log/appointmentCallService";

export const logController = {
  entry(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id"], ({ patient_id }) => {
      entryService.register(patient_id);
    }, "Entry registered successfully.");
  },

  triageCall(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id"], ({ patient_id }) => {
      triageCallService.call(patient_id);
    }, "Triage called successfully.");
  },

  urgencyDefinition(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id", "urgency_classification"], ({ patient_id, urgency_classification }) => {
      urgencyDefinitionService.define(patient_id, urgency_classification);
    }, "Urgency defined successfully.");
  },

  appointmentCall(req: Request, res: Response) {
    return handleLogAction(req, res, ["patient_id"], ({ patient_id }) => {
      appointmentCallService.call(patient_id);
    }, "Appointment call registered successfully.");
  }
};
