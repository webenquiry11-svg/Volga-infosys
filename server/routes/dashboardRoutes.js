import express from "express";
import { protect } from "../middleware/auth.js";
import { getStats, getContacts, updateContact, deleteContact, getEmailLogs, deleteEmailLog, deleteAllEmailLogs } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/contacts", getContacts);
router.get("/emails", getEmailLogs);
router.delete("/emails", deleteAllEmailLogs);
router.delete("/emails/:id", deleteEmailLog);
router.patch("/contacts/:id", updateContact);
router.delete("/contacts/:id", deleteContact);

export default router;
