import { Request, Response, NextFunction } from "express";

const API_TOKEN = process.env.API_TOKEN;

export function simpleAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  if (token !== API_TOKEN) {
    return res.status(403).json({ error: "Token inválido" });
  }

  next();
}
