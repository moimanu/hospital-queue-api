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

app.listen(3000, () => {
  console.log("\n🚀 Server running on http://localhost:3000/api-docs");
});
