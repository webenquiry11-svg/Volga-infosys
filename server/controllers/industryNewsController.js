import IndustryNews from "../models/IndustryNews.js";
import { logActivity } from "./dashboardController.js";

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
    await logActivity(req.user?._id, "create", "industry_news", item._id, `Created news: ${item.title}`);
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
    const item = await IndustryNews.findByIdAndDelete(req.params.id);
    if (item) await logActivity(req.user?._id, "delete", "industry_news", req.params.id, `Deleted news: ${item.title}`);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const duplicateIndustryNews = async (req, res) => {
  try {
    const source = await IndustryNews.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Not found" });
    const { _id, createdAt, updatedAt, __v, ...data } = source.toObject();
    const copy = await IndustryNews.create({ ...data, title: `Copy of ${data.title}` });
    await logActivity(req.user?._id, "duplicate", "industry_news", copy._id, `Duplicated news: ${source.title}`);
    res.status(201).json(copy);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
