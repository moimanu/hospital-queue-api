import { Router } from "express";
import { logRoutes } from "./logRoutes";

const router = Router();

router.use("/logs", logRoutes);

export default router;
