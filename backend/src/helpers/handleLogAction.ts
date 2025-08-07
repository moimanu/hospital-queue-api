import { Request, Response } from "express";

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
    action(req.body);
    return res.status(200).json({ message: successMessage });
  } catch (err: any) {
    return res.status(err?.status || 500).json({ error: err?.message || "Internal server error." });
  }
}
