import { Request, Response } from "express";
import { cacheService } from "../services/cache/cacheService";

let clients: Response[] = [];

export function streamHandler(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify(cacheService.getCache())}\n\n`);
  clients.push(res);

  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
}

cacheService.onUpdate(data => {
  clients.forEach(c => c.write(`data: ${JSON.stringify(data)}\n\n`));
});
