import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";
import { initializeDatabase } from './database/initializeDb';
import { startCancelTimeoutRoutine } from "./routines/cancelTimeout";

const app = express();

// Lista de origens permitidas (frontend e backend)
const allowedOrigins = [
  process.env.FRONTEND_URL!,
  process.env.BACKEND_URL!
];

// Configuração CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Rotas
app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Inicializações
initializeDatabase();
startCancelTimeoutRoutine();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on ${process.env.BACKEND_URL}/api-docs`);
});
