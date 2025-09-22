import { Request, Response } from "express";
import { cacheService } from "../services/cache/cacheService";

let clients: Response[] = [];

export function streamHandler(req: Request, res: Response) {
  // Headers obrigatórios SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Pequeno delay para garantir que proxy do Render repasse os headers
  setTimeout(() => res.flushHeaders(), 10);

  // Enviar cache inicial
  res.write(`data: ${JSON.stringify(cacheService.getCache())}\n\n`);
  clients.push(res);

  // Heartbeat para manter conexão viva
  const heartbeat = setInterval(() => {
    res.write(":\n\n");
  }, 20000); // 20s

  // Limpar cliente quando desconectar
  req.on("close", () => {
    clearInterval(heartbeat);
    clients = clients.filter(c => c !== res);
  });
}

// Atualizações do cache para todos os clientes conectados
cacheService.onUpdate(data => {
  clients.forEach(c => c.write(`data: ${JSON.stringify(data)}\n\n`));
});
