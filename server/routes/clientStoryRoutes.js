import express from "express";
import { getClientStories, getClientStory, createClientStory, updateClientStory, deleteClientStory, duplicateClientStory } from "../controllers/clientStoryController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getClientStories);
router.get("/:id", getClientStory);
router.post("/", protect, createClientStory);
router.post("/:id/duplicate", protect, duplicateClientStory);
router.patch("/:id", protect, updateClientStory);
router.delete("/:id", protect, deleteClientStory);

export default router;
