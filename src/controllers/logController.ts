import { Request, Response } from "express";
import { logEntryService } from "../services/logEntryService";

export const logController = {
  entry(req: Request, res: Response) {
    const { patient_id } = req.body;

    if (!patient_id) { return res.status(400).json({ error: "Missing patient_id" });}

    try {
      logEntryService.register(patient_id);
      return res.status(201).json({ message: "Entry registered successfully." });
    } catch (err) { return res.status(500).json({ error: "Internal server error." });}
  }
};
