import { Request, Response, NextFunction } from "express";

export function simpleAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = parts[1];

  if (token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
