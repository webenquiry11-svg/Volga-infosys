import ClientStory from "../models/ClientStory.js";
import { logActivity } from "./dashboardController.js";

export const getClientStories = async (req, res) => {
  const stories = await ClientStory.find().sort({ order: 1, createdAt: 1 });
  res.json(stories);
};

export const getClientStory = async (req, res) => {
  try {
    const item = await ClientStory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createClientStory = async (req, res) => {
  try {
    const story = await ClientStory.create(req.body);
    await logActivity(req.user?._id, "create", "client_story", story._id, `Created story: ${story.clientName}`);
    res.status(201).json(story);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateClientStory = async (req, res) => {
  try {
    const story = await ClientStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!story) return res.status(404).json({ message: "Not found" });
    res.json(story);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteClientStory = async (req, res) => {
  try {
    const story = await ClientStory.findByIdAndDelete(req.params.id);
    if (story) await logActivity(req.user?._id, "delete", "client_story", req.params.id, `Deleted story: ${story.clientName}`);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const duplicateClientStory = async (req, res) => {
  try {
    const source = await ClientStory.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Not found" });
    const { _id, createdAt, updatedAt, __v, ...data } = source.toObject();
    const copy = await ClientStory.create({ ...data, clientName: `Copy of ${data.clientName}` });
    await logActivity(req.user?._id, "duplicate", "client_story", copy._id, `Duplicated story: ${source.clientName}`);
    res.status(201).json(copy);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
