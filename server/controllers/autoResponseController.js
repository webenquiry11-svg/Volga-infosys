import AutoResponse from "../models/AutoResponse.js";
import EmailLog from "../models/EmailLog.js";
import { sendEmail } from "../config/emailService.js";

/**
 * Get all auto-responses
 */
export const getAutoResponses = async (req, res) => {
  try {
    const responses = await AutoResponse.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: responses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new auto-response
 */
export const createAutoResponse = async (req, res) => {
  try {
    const {
      responseType,
      subject,
      message,
      keywords,
      respondToContactForm,
      respondToAllEmails,
      respondOnlyOnce,
      delaySeconds
    } = req.body;

    // Disable all other simple responses if this is simple type
    if (responseType === "simple") {
      await AutoResponse.updateMany(
        { responseType: "simple", _id: { $ne: null } },
        { enabled: false }
      );
    }

    const autoResponse = await AutoResponse.create({
      responseType,
      subject,
      message,
      keywords: keywords || [],
      respondToContactForm,
      respondToAllEmails,
      respondOnlyOnce,
      delaySeconds,
      enabled: true
    });

    res.status(201).json({
      success: true,
      message: "Auto-response created successfully",
      data: autoResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update auto-response
 */
export const updateAutoResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const autoResponse = await AutoResponse.findByIdAndUpdate(id, updates, {
      new: true
    });

    if (!autoResponse) {
      return res.status(404).json({ success: false, message: "Auto-response not found" });
    }

    res.status(200).json({
      success: true,
      message: "Auto-response updated successfully",
      data: autoResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle auto-response enabled/disabled
 */
export const toggleAutoResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const autoResponse = await AutoResponse.findById(id);

    if (!autoResponse) {
      return res.status(404).json({ success: false, message: "Auto-response not found" });
    }

    autoResponse.enabled = !autoResponse.enabled;
    await autoResponse.save();

    res.status(200).json({
      success: true,
      message: `Auto-response ${autoResponse.enabled ? "enabled" : "disabled"}`,
      data: autoResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete auto-response
 */
export const deleteAutoResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AutoResponse.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Auto-response not found" });
    }

    res.status(200).json({
      success: true,
      message: "Auto-response deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get email logs
 */
export const getEmailLogs = async (req, res) => {
  try {
    const { type, status, from, to, startDate, endDate } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    const logs = await EmailLog.find(filters)
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get email statistics
 */
export const getEmailStats = async (req, res) => {
  try {
    const totalEmails = await EmailLog.countDocuments();
    const sentEmails = await EmailLog.countDocuments({ status: "sent" });
    const failedEmails = await EmailLog.countDocuments({ status: "failed" });
    const autoResponses = await EmailLog.countDocuments({ type: "auto-response" });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentEmails = await EmailLog.countDocuments({ createdAt: { $gte: last7Days } });

    res.status(200).json({
      success: true,
      data: {
        totalEmails,
        sentEmails,
        failedEmails,
        autoResponses,
        recentEmails,
        successRate: totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Test auto-response by sending to admin email
 */
export const testAutoResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const autoResponse = await AutoResponse.findById(id);

    if (!autoResponse) {
      return res.status(404).json({ success: false, message: "Auto-response not found" });
    }

    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `[TEST] ${autoResponse.subject}`,
      html: `<p><strong>Test Auto-Response:</strong></p><p>${autoResponse.message}</p>`,
      type: "auto-response"
    });

    res.status(200).json({
      success: result.success,
      message: result.success ? "Test email sent successfully" : "Failed to send test email",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
