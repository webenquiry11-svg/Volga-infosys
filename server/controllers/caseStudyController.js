import CaseStudy from "../models/CaseStudy.js";

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
    await CaseStudy.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
