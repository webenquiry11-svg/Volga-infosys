import Contact from "../models/Contact.js";
import Blog from "../models/Blog.js";
import Project from "../models/Project.js";
import EmailLog from "../models/EmailLog.js";
import ClientStory from "../models/ClientStory.js";
import Note from "../models/Note.js";
import ActivityLog from "../models/ActivityLog.js";
import { sendEmail } from "../config/emailService.js";


// ── Activity logging helper ─────────────────────────────────────────────────
export async function logActivity(adminId, action, entity, entityId, details = "") {
  try {
    await ActivityLog.create({ adminId, action, entity, entityId, details });
  } catch (err) {
    console.error("logActivity error:", err.message);
  }
}


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
  const [
    projectsCount,
    blogsCount,
    clientStoriesCount
  ] = await Promise.all([
    Project.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    ClientStory.countDocuments()
  ]);

  res.json({
    solutionTypes: 10,
    industriesServed: 15,
    projectsDelivered: projectsCount,
    blogsCount,
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

  // Log status changes
  if (req.body.status) {
    await logActivity(req.user?._id, "status_update", "contact", contact._id,
      `Status changed to ${req.body.status}`);
  }

  res.json(contact);
};

export const deleteContact = async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ message: "Not found" });

  await logActivity(req.user?._id, "delete", "contact", req.params.id,
    `Deleted lead: ${contact.name}`);

  res.json({ message: "Deleted" });
};

// ── Bulk delete contacts ────────────────────────────────────────────────────
export const bulkDeleteContacts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: "No IDs provided" });
    }
    const result = await Contact.deleteMany({ _id: { $in: ids } });
    await logActivity(req.user?._id, "bulk_delete", "contact", null,
      `Bulk deleted ${result.deletedCount} leads`);
    res.json({ message: `Deleted ${result.deletedCount} leads`, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Update lead notes ────────────────────────────────────────────────────────
export const updateContactNotes = async (req, res) => {
  try {
    const { notes, followUpDate } = req.body;
    const update = {};
    if (notes !== undefined) update.notes = notes;
    if (followUpDate !== undefined) update.followUpDate = followUpDate || null;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Not found" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Quick reply email ────────────────────────────────────────────────────────
export const replyToContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    const { subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ message: "Subject and body are required" });
    }

    const result = await sendEmail({
      to: contact.email,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#013350;padding:16px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-weight:bold;font-size:1.1rem;letter-spacing:2px;">VOLGA</span>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
          ${body.replace(/\n/g, '<br>')}
        </div>
        <p style="color:#888;font-size:0.8rem;text-align:center;margin-top:12px;">
          &copy; ${new Date().getFullYear()} VOLGA Infosys
        </p>
      </div>`,
      text: body,
      type: "outgoing",
      contactFormId: contact._id
    });

    if (!result.success) {
      return res.status(500).json({ message: result.error || "Email failed to send" });
    }

    await logActivity(req.user?._id, "email_reply", "contact", contact._id,
      `Replied to ${contact.email}: ${subject}`);

    res.json({ message: "Email sent", logId: result.logId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Notes Endpoints ─────────────────────────────────────────────────────────
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
      author: req.user?._id
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

// ── Search Leads ────────────────────────────────────────────────────────────
export const searchLeads = async (req, res) => {
  try {
    const { q, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;
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

// ── Export to CSV ────────────────────────────────────────────────────────────
export const exportLeads = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    const headers = [
      "Name", "Email", "Company", "Country", "Service Interested",
      "Status", "Source", "Follow-up Date", "Created At"
    ];
    const csvRows = [headers.join(",")];

    contacts.forEach(contact => {
      const row = [
        `"${(contact.name || "").replace(/"/g, '""')}"`,
        `"${(contact.email || "").replace(/"/g, '""')}"`,
        `"${(contact.company || "").replace(/"/g, '""')}"`,
        `"${(contact.country || "").replace(/"/g, '""')}"`,
        `"${(contact.serviceInterested || "").replace(/"/g, '""')}"`,
        `"${(contact.status || "").replace(/"/g, '""')}"`,
        `"${(contact.source || "").replace(/"/g, '""')}"`,
        `"${contact.followUpDate ? contact.followUpDate.toISOString().slice(0,10) : ""}"`,
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

// ── Leads chart (last 30 days) ───────────────────────────────────────────────
export const getLeadsChart = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const data = await Contact.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days with 0
    const map = {};
    data.forEach(d => { map[d._id] = d.count; });

    const result = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: map[key] || 0 });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── New leads count (for notification bell) ──────────────────────────────────
export const getNewLeadsCount = async (req, res) => {
  try {
    const { since } = req.query;
    const filter = { status: "new" };
    if (since) {
      const sinceDate = new Date(parseInt(since, 10));
      if (!isNaN(sinceDate)) filter.createdAt = { $gt: sinceDate };
    }
    const count = await Contact.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Activity log ─────────────────────────────────────────────────────────────
export const getActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate("adminId", "name email"),
      ActivityLog.countDocuments()
    ]);
    res.json({ logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Pipeline (kanban) contacts ────────────────────────────────────────────────
export const getPipelineContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}, "name email serviceInterested status createdAt")
      .sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
