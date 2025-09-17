import "dotenv/config";
import express from "express";
import router from "./routes";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";
import { initializeDatabase } from './database/initializeDb';
import { startCancelTimeoutRoutine } from "./routines/cancelTimeout";

const app = express();
app.use(express.json());
app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

initializeDatabase();
startCancelTimeoutRoutine();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}/api-docs`);
});
