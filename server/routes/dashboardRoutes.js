import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getStats, getContacts, updateContact, deleteContact, getEmailLogs, deleteEmailLog, deleteAllEmailLogs, getNotes, addNote, deleteNote, searchLeads, exportLeads } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect);

// Read-only endpoints (all roles can access)
router.get("/stats", getStats);
router.get("/contacts", getContacts);
router.get("/contacts/search", searchLeads);
router.get("/contacts/export", exportLeads);
router.get("/emails", getEmailLogs);
router.get("/contacts/:contactId/notes", getNotes);

// Editor/Admin only endpoints (write access)
router.post("/contacts/:contactId/notes", authorize("admin", "editor"), addNote);
router.delete("/contacts/:contactId/notes/:noteId", authorize("admin", "editor"), deleteNote);
router.patch("/contacts/:id", authorize("admin", "editor"), updateContact);

// Admin only endpoints (delete/create access)
router.delete("/emails", authorize("admin"), deleteAllEmailLogs);
router.delete("/emails/:id", authorize("admin"), deleteEmailLog);
router.delete("/contacts/:id", authorize("admin"), deleteContact);

export default router;
