import CaseStudy from "../models/CaseStudy.js";
import { logActivity } from "./dashboardController.js";

export const getCaseStudies = async (req, res) => {
  const caseStudies = await CaseStudy.find().sort({ order: 1, createdAt: -1 });
  res.json(caseStudies);
};

export const getCaseStudy = async (req, res) => {
  try {
    const item = await CaseStudy.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createCaseStudy = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.create(req.body);
    await logActivity(req.user?._id, "create", "case_study", caseStudy._id, `Created case study: ${caseStudy.title}`);
    res.status(201).json(caseStudy);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateCaseStudy = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!caseStudy) return res.status(404).json({ message: "Not found" });
    res.json(caseStudy);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteCaseStudy = async (req, res) => {
  try {
    const cs = await CaseStudy.findByIdAndDelete(req.params.id);
    if (cs) await logActivity(req.user?._id, "delete", "case_study", req.params.id, `Deleted case study: ${cs.title}`);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const duplicateCaseStudy = async (req, res) => {
  try {
    const source = await CaseStudy.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Not found" });
    const { _id, createdAt, updatedAt, __v, ...data } = source.toObject();
    const copy = await CaseStudy.create({ ...data, title: `Copy of ${data.title}` });
    await logActivity(req.user?._id, "duplicate", "case_study", copy._id, `Duplicated case study: ${source.title}`);
    res.status(201).json(copy);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
