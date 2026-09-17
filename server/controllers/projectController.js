import Project from "../models/Project.js";
import { logActivity } from "./dashboardController.js";

export const getProjects = async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: 1 });
  res.json(projects);
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createProject = async (req, res) => {
  try {
    if (req.body && req.body.description) {
      req.body.description = req.body.description.replace(/<[^>]*>?/gm, '').trim();
    }
    const project = await Project.create(req.body);
    await logActivity(req.user?._id, "create", "project", project._id, `Created project: ${project.title}`);
    res.status(201).json(project);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    if (req.body && req.body.description) {
      req.body.description = req.body.description.replace(/<[^>]*>?/gm, '').trim();
    }
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: "Not found" });
    res.json(project);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (project) await logActivity(req.user?._id, "delete", "project", req.params.id, `Deleted project: ${project.title}`);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const duplicateProject = async (req, res) => {
  try {
    const source = await Project.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Not found" });
    const { _id, createdAt, updatedAt, __v, ...data } = source.toObject();
    const copy = await Project.create({ ...data, title: `Copy of ${data.title}` });
    await logActivity(req.user?._id, "duplicate", "project", copy._id, `Duplicated project: ${source.title}`);
    res.status(201).json(copy);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
