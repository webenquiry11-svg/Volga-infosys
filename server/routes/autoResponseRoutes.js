import express from "express";
import * as autoResponseController from "../controllers/autoResponseController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);

// Auto-response management
router.get("/", autoResponseController.getAutoResponses);
router.post("/", autoResponseController.createAutoResponse);
router.patch("/:id", autoResponseController.updateAutoResponse);
router.patch("/:id/toggle", autoResponseController.toggleAutoResponse);
router.delete("/:id", autoResponseController.deleteAutoResponse);
router.post("/:id/test", autoResponseController.testAutoResponse);

// Email logs
router.get("/logs/all", autoResponseController.getEmailLogs);
router.get("/stats/dashboard", autoResponseController.getEmailStats);

export default router;
