import { Router } from "express";
import { logController } from "../controllers/logController";
import { simpleAuthMiddleware } from "../middlewares/simpleAuthMiddleware";

export const logRoutes = Router();

/**
 * @swagger
 * /logs/entry:
 *   post:
 *     summary: Register patient entry at the hospital
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
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
logRoutes.post("/entry", simpleAuthMiddleware, logController.entry);

/**
 * @swagger
 * /logs/triage-call:
 *   put:
 *     summary: Log triage call for patient
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
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
 *       200:
 *         description: Triage called successfully
 *       400:
 *         description: Missing patient_id
 *       500:
 *         description: Internal server error
 */
logRoutes.put("/triage-call", simpleAuthMiddleware, logController.triageCall);

/**
 * @swagger
 * /logs/urgency-definition:
 *   put:
 *     summary: Define urgency classification for a patient
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: string
 *               urgency_classification:
 *                 type: string
 *                 enum: [blue, green, yellow, orange, red]
 *     responses:
 *       200:
 *         description: Urgency defined successfully
 *       400:
 *         description: Missing patient_id or urgency_classification
 *       500:
 *         description: Internal server error
 */
logRoutes.put("/urgency-definition", simpleAuthMiddleware, logController.urgencyDefinition);

/**
 * @swagger
 * /logs/appointment-call:
 *   put:
 *     summary: Register appointment call for a patient
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
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
 *       200:
 *         description: Appointment call registered successfully
 *       400:
 *         description: Missing patient_id
 *       500:
 *         description: Internal server error
 */
logRoutes.put("/appointment-call", simpleAuthMiddleware, logController.appointmentCall);
