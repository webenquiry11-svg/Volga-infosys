import Contact from "../models/Contact.js";
import AutoResponse from "../models/AutoResponse.js";
import EmailLog from "../models/EmailLog.js";
import { sendEmail, sendConfirmationEmail, sendAdminNotification } from "../config/emailService.js";

export const createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    // Send confirmation email to contact form submitter
    const confirmationResult = await sendConfirmationEmail(req.body, contact._id);
    
    // Send admin notification
    const adminResult = await sendAdminNotification(req.body, contact._id);

    res.status(201).json({
      success: true,
      message: "Contact saved and confirmation email sent",
      data: {
        contact,
        emailStatus: {
          confirmationSent: confirmationResult.success,
          adminNotified: adminResult.success
        }
      }
    });

  } catch (error) {
    console.error("Contact error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all contacts with email tracking
 */
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    // Enhance with email log info
    const contactsWithEmailStatus = await Promise.all(
      contacts.map(async (contact) => {
        const emailLogs = await EmailLog.find({ contactFormId: contact._id });
        return {
          ...contact.toObject(),
          emailHistory: emailLogs
        };
      })
    );

    res.status(200).json({ success: true, data: contactsWithEmailStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a single contact with full email history
 */
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    const emailLogs = await EmailLog.find({ contactFormId: contact._id });

    res.status(200).json({
      success: true,
      data: {
        ...contact.toObject(),
        emailHistory: emailLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


