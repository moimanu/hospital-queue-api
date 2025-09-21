import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";
import { initializeDatabase } from './database/initializeDb';
import { startCancelTimeoutRoutine } from "./routines/cancelTimeout";

const app = express();

// Configuração CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET'],
  credentials: true
}));


app.use(express.json());

// Rotas
app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

initializeDatabase();
startCancelTimeoutRoutine();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}/api-docs`);
});
