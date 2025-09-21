import { Router } from "express";
import { streamHandler } from "../sse/publicStream";

export const sseRoutes = Router();

sseRoutes.get("/events", streamHandler);
