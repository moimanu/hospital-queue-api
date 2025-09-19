import { Request, Response } from "express";
import { encryptDeterministic } from "../utils/crypto";

type ActionFunction = (body: any) => void;

export function handleLogAction(
  req: Request,
  res: Response,
  requiredFields: string[],
  action: ActionFunction,
  successMessage: string
) {
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Missing ${field}` });
    }
  }

  try {
    const body = { ...req.body };

    // criptografar o patient_id se existir
    if (body.patient_id) {
      body.patient_id = encryptDeterministic(body.patient_id.toString());
    }

    action(body);

    return res.status(200).json({ message: successMessage });
  } catch (err: any) {
    return res
      .status(err?.status || 500)
      .json({ error: err?.message || "Internal server error." });
  }
}
