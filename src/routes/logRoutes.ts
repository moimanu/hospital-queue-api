import { Router } from "express";
import { logController } from "../controllers/logController";

export const logRoutes = Router();

/**
 * @swagger
 * /logs/entry:
 *   post:
 *     summary: Register patient entry at the hospital
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entry registered successfully
 *       400:
 *         description: Missing patient_id
 *       500:
 *         description: Internal server error
 */
logRoutes.post("/entry", logController.entry);
