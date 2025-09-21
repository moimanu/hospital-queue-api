import { Router } from "express";
import { logRoutes } from "./logRoutes";
import { sseRoutes } from "./sseRoutes";

const router = Router();

router.use("/logs", logRoutes);
router.use("/sse", sseRoutes);

export default router;
