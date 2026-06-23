import AutoResponse from "../models/AutoResponse.js";
import EmailLog from "../models/EmailLog.js";
import { sendEmail } from "./emailService.js";

/**
 * Check for matching keyword-based auto-response
 */
export const findMatchingAutoResponse = async (emailContent) => {
  const keywordResponses = await AutoResponse.findOne({
    enabled: true,
    responseType: "keyword-based"
  });

  if (!keywordResponses) return null;

  const contentLower = emailContent.toLowerCase();
  
  for (const keyword of keywordResponses.keywords || []) {
    if (contentLower.includes(keyword.keyword.toLowerCase())) {
      return {
        ...keywordResponses.toObject(),
        matchedKeyword: keyword.keyword,
        message: keyword.response
      };
    }
  }

  return null;
};

/**
 * Send auto-response with duplicate check
 */
export const sendAutoResponse = async (recipientEmail, autoResponse, contactFormId = null) => {
  try {
    // Check if already responded (if respondOnlyOnce is enabled)
    if (autoResponse.respondOnlyOnce) {
      const existingResponse = await EmailLog.findOne({
        to: recipientEmail,
        type: "auto-response",
        autoResponseId: autoResponse._id
      });

      if (existingResponse) {
        console.log(`Already sent auto-response to ${recipientEmail}`);
        return {
          success: false,
          reason: "already-responded",
          message: "Auto-response already sent to this address"
        };
      }
    }

    // Send the auto-response
    const result = await sendEmail({
      to: recipientEmail,
      subject: autoResponse.subject,
      html: autoResponse.message,
      type: "auto-response",
      contactFormId,
      autoResponseId: autoResponse._id
    });

    return result;
  } catch (error) {
    console.error("Error sending auto-response:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process incoming email and send auto-response if applicable
 */
export const processIncomingEmail = async (emailData) => {
  const { from, to, subject, body, contactFormId } = emailData;

  try {
    // Log incoming email
    const incomingLog = await EmailLog.create({
      from,
      to,
      subject,
      message: body,
      type: "incoming",
      status: "received",
      contactFormId
    });

    // Check for simple auto-response
    let autoResponse = await AutoResponse.findOne({
      enabled: true,
      responseType: "simple",
      respondToAllEmails: true
    });

    // Or check keyword-based
    if (!autoResponse) {
      autoResponse = await findMatchingAutoResponse(body);
    }

    if (autoResponse) {
      await sendAutoResponse(from, autoResponse, contactFormId);
    }

    return {
      success: true,
      logId: incomingLog._id,
      autoResponseSent: !!autoResponse
    };
  } catch (error) {
    console.error("Error processing incoming email:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get email statistics for dashboard
 */
export const getEmailStatistics = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = {
    total: await EmailLog.countDocuments({ createdAt: { $gte: startDate } }),
    sent: await EmailLog.countDocuments({ status: "sent", createdAt: { $gte: startDate } }),
    failed: await EmailLog.countDocuments({ status: "failed", createdAt: { $gte: startDate } }),
    autoResponses: await EmailLog.countDocuments({ 
      type: "auto-response", 
      createdAt: { $gte: startDate } 
    }),
    outgoing: await EmailLog.countDocuments({ 
      type: "outgoing", 
      createdAt: { $gte: startDate } 
    }),
    incoming: await EmailLog.countDocuments({ 
      type: "incoming", 
      createdAt: { $gte: startDate } 
    })
  };

  return {
    ...stats,
    successRate: stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(2) : 0,
    period: `Last ${days} days`
  };
};

/**
 * Cleanup old email logs (optional maintenance)
 */
export const cleanupOldLogs = async (daysToKeep = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await EmailLog.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: "failed" // Only delete failed emails older than retention period
  });

  return {
    deletedCount: result.deletedCount,
    cutoffDate
  };
};

export default {
  findMatchingAutoResponse,
  sendAutoResponse,
  processIncomingEmail,
  getEmailStatistics,
  cleanupOldLogs
};
