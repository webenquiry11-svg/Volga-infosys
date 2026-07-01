import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getStats,
  getContacts,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  updateContactNotes,
  replyToContact,
  getEmailLogs,
  deleteEmailLog,
  deleteAllEmailLogs,
  getNotes,
  addNote,
  deleteNote,
  searchLeads,
  exportLeads,
  getLeadsChart,
  getNewLeadsCount,
  getActivityLog,
  getPipelineContacts,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect);

// Read-only endpoints (all roles can access)
router.get("/stats", getStats);
router.get("/contacts", getContacts);
router.get("/contacts/search", searchLeads);
router.get("/contacts/export", exportLeads);
router.get("/emails", getEmailLogs);
router.get("/contacts/:contactId/notes", getNotes);
router.get("/leads-chart", getLeadsChart);
router.get("/new-leads-count", getNewLeadsCount);
router.get("/activity", getActivityLog);
router.get("/pipeline", getPipelineContacts);

// Editor/Admin only endpoints (write access)
router.post("/contacts/:contactId/notes", authorize("admin", "editor"), addNote);
router.delete("/contacts/:contactId/notes/:noteId", authorize("admin", "editor"), deleteNote);
router.patch("/contacts/:id", authorize("admin", "editor"), updateContact);
router.put("/contacts/:id/notes", authorize("admin", "editor"), updateContactNotes);
router.post("/contacts/:id/reply", authorize("admin", "editor"), replyToContact);

// Admin only endpoints
router.delete("/emails", authorize("admin"), deleteAllEmailLogs);
router.delete("/emails/:id", authorize("admin"), deleteEmailLog);
router.delete("/contacts/bulk", authorize("admin"), bulkDeleteContacts);
router.delete("/contacts/:id", authorize("admin"), deleteContact);

export default router;
