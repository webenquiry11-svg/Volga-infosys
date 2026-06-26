import Contact from "../models/Contact.js";
import Blog from "../models/Blog.js";
import Project from "../models/Project.js";
import EmailLog from "../models/EmailLog.js";
import CaseStudy from "../models/CaseStudy.js";
import IndustryNews from "../models/IndustryNews.js";
import ClientStory from "../models/ClientStory.js";
import Note from "../models/Note.js";


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
    Project.countDocuments(),
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    Blog.countDocuments({ status: "draft" }),
    Blog.countDocuments({ status: "archived" }),
    CaseStudy.countDocuments(),
    IndustryNews.countDocuments(),
    EmailLog.countDocuments(),
    EmailLog.countDocuments({ type: "incoming" }),
    EmailLog.countDocuments({ type: "outgoing" }),
    EmailLog.countDocuments({ type: "auto-response" }),
    EmailLog.find().sort({ createdAt: -1 }).limit(5),
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
    Project.countDocuments(),
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
    EmailLog.find(filter).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
    EmailLog.countDocuments(filter)
  ]);
  res.json({ emails, total, pages: Math.ceil(total / limit) });
};

export const deleteEmailLog = async (req, res) => {
  const log = await EmailLog.findByIdAndDelete(req.params.id);
  if (!log) return res.status(404).json({ message: "Email log not found" });
  res.json({ message: "Deleted" });
};

export const deleteAllEmailLogs = async (req, res) => {
  const result = await EmailLog.deleteMany({});
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

// Notes Endpoints
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ contactId: req.params.contactId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addNote = async (req, res) => {
  try {
    const note = new Note({
      contactId: req.params.contactId,
      content: req.body.content,
      author: req.user?._id // if auth is set up
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.noteId);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search Leads
export const searchLeads = async (req, res) => {
  try {
    const { q, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { country: { $regex: q, $options: 'i' } }
      ];
    }
    const contacts = await Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Contact.countDocuments(filter);
    res.json({ contacts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export to CSV
export const exportLeads = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    const headers = [
      "Name",
      "Email",
      "Company",
      "Country",
      "Service Interested",
      "Budget",
      "Status",
      "Created At"
    ];
    const csvRows = [headers.join(",")];

    contacts.forEach(contact => {
      const row = [
        `"${(contact.name || "").replace(/"/g, '""')}"`,
        `"${(contact.email || "").replace(/"/g, '""')}"`,
        `"${(contact.company || "").replace(/"/g, '""')}"`,
        `"${(contact.country || "").replace(/"/g, '""')}"`,
        `"${(contact.serviceInterested || "").replace(/"/g, '""')}"`,
        `"${(contact.budget || "").replace(/"/g, '""')}"`,
        `"${(contact.status || "").replace(/"/g, '""')}"`,
        `"${contact.createdAt.toISOString()}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
