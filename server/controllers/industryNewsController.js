import IndustryNews from "../models/IndustryNews.js";

export const getIndustryNews = async (req, res) => {
  const news = await IndustryNews.find().sort({ order: 1, publishedAt: -1, createdAt: -1 });
  res.json(news);
};

export const getIndustryNewsItem = async (req, res) => {
  try {
    const item = await IndustryNews.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createIndustryNews = async (req, res) => {
  try {
    const item = await IndustryNews.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateIndustryNews = async (req, res) => {
  try {
    const item = await IndustryNews.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteIndustryNews = async (req, res) => {
  try {
    await IndustryNews.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
