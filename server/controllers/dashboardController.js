import Contact from "../models/Contact.js";
import Blog from "../models/Blog.js";
import project from "../models/Project.js";
import emaillog from "../models/EmailLog.js";
import CaseStudy from "../models/CaseStudy.js";
import IndustryNews from "../models/IndustryNews.js";
import ClientStory from "../models/ClientStory.js";


export const getStats = async (req, res) => {
  const [
    total, 
    byStatus, 
    byService, 
    projectsCount, 
    blogsCount,
    publishedBlogsCount,
    draftBlogsCount,
    archivedBlogsCount,
    caseStudiesCount, 
    industryNewsCount, 
    emailCount, 
    incomingCount, 
    outgoingCount, 
    autoResponseCount, 
    recentEmails,
    recentBlogs
  ] = await Promise.all([
    Contact.countDocuments(),
    Contact.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Contact.aggregate([{ $group: { _id: "$serviceInterested", count: { $sum: 1 } } }]),
    project.countDocuments(),
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    Blog.countDocuments({ status: "draft" }),
    Blog.countDocuments({ status: "archived" }),
    CaseStudy.countDocuments(),
    IndustryNews.countDocuments(),
    emaillog.countDocuments(),
    emaillog.countDocuments({ type: "incoming" }),
    emaillog.countDocuments({ type: "outgoing" }),
    emaillog.countDocuments({ type: "auto-response" }),
    emaillog.find().sort({ createdAt: -1 }).limit(5),
    Blog.find().sort({ createdAt: -1 }).limit(5)
  ]);

  res.json({
    total,
    byStatus,
    byService,
    projectsCount,
    blogsCount,
    publishedBlogsCount,
    draftBlogsCount,
    archivedBlogsCount,
    caseStudiesCount,
    industryNewsCount,
    emailStats: {
      total: emailCount,
      incoming: incomingCount,
      outgoing: outgoingCount,
      autoResponses: autoResponseCount,
      recent: recentEmails
    },
    recentBlogs
  });
};

export const getPublicStats = async (req, res) => {
  // Get public facing stats for the website
  const [
    projectsCount, 
    caseStudiesCount, 
    industryNewsCount, 
    blogsCount,
    clientStoriesCount
  ] = await Promise.all([
    project.countDocuments(),
    CaseStudy.countDocuments(),
    IndustryNews.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    ClientStory.countDocuments()
  ]);

  res.json({
    solutionTypes: 10, // Static or can calculate unique from projects
    industriesServed: 15, // Static or unique from projects/clients
    projectsDelivered: projectsCount,
    blogsCount,
    caseStudiesCount,
    industryNewsCount,
    clientStoriesCount
  });
};

export const getEmailLogs = async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const skip = (page - 1) * limit;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  const [emails, total] = await Promise.all([
    emaillog.find(filter).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
    emaillog.countDocuments(filter)
  ]);
  res.json({ emails, total, pages: Math.ceil(total / limit) });
};

export const deleteEmailLog = async (req, res) => {
  const log = await emaillog.findByIdAndDelete(req.params.id);
  if (!log) return res.status(404).json({ message: "Email log not found" });
  res.json({ message: "Deleted" });
};

export const deleteAllEmailLogs = async (req, res) => {
  const result = await emaillog.deleteMany({});
  res.json({ message: `Deleted ${result.deletedCount} email logs.` });
};

export const getContacts = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const contacts = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Contact.countDocuments(filter);
  res.json({ contacts, total, pages: Math.ceil(total / limit) });
};

export const updateContact = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
  if (!contact) return res.status(404).json({ message: "Not found" });
  res.json(contact);
};

export const deleteContact = async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
