import express from "express";
import router from "./routes";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());
app.use("/api", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/api-docs");
});
