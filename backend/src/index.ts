import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";
import { initializeDatabase } from './database/initializeDb';
import { startCancelTimeoutRoutine } from "./routines/cancelTimeout";
import { streamHandler } from "./sse/publicStream";

const app = express();

// Variáveis de ambiente
const FRONTEND_URL = process.env.FRONTEND_URL!;
const BACKEND_URL = process.env.BACKEND_URL!;

// Middleware CORS global
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Rotas normais
app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// SSE route com CORS aplicado diretamente
app.options("/api/sse/events", cors({ origin: FRONTEND_URL, methods: ["GET"], credentials: true }));
app.get("/api/sse/events", cors({ origin: FRONTEND_URL, methods: ["GET"], credentials: true }), streamHandler);

// Inicializações
initializeDatabase();
startCancelTimeoutRoutine();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on ${BACKEND_URL}/api-docs`);
});
