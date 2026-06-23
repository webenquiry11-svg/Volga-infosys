import ClientStory from "../models/ClientStory.js";

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
    await ClientStory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
