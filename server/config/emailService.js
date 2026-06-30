import transporter from "./email.js";
import EmailLog from "../models/EmailLog.js";

const isDev = process.env.NODE_ENV === "development";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send email with logging and confirmation.
 * In development, logs to console instead of sending real email
 * to avoid triggering spam filters during testing.
 */
export const sendEmail = async (options, retries = 3) => {
  const {
    from = `"VOLGA Infosys" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    contactFormId = null,
    type = "outgoing"
  } = options;
  
  // Ensure 'to' is always an array
  const toArray = Array.isArray(to) ? to : [to];

  try {
    // Log the email
    const emailLog = await EmailLog.create({
      from,
      to: toArray,
      subject,
      message: html,
      type,
      status: "pending",
      contactFormId
    });

    // Temporarily disable DEV MODE check to send real emails (remove this later if needed)
    // In development, skip sending real email to avoid spam filter training
    // if (isDev) {
    //   console.log("\n📧 ─── DEV MODE: Email not sent (logged only) ───────────");
    //   console.log(`   To:      ${toArray.join(', ')}`);
    //   console.log(`   From:    ${from}`);
    //   console.log(`   Subject: ${subject}`);
    //   console.log(`   Text:    ${options.text || subject}`);
    //   console.log("────────────────────────────────────────────────────────\n");

    //   await EmailLog.findByIdAndUpdate(emailLog._id, { status: "sent" });
    //   return { success: true, messageId: "dev-mode", logId: emailLog._id };
    // }

    // Send email
    const info = await transporter.sendMail({
      from,
      to: toArray.join(', '),
      subject,
      html,
      // Plain text fallback — improves deliverability significantly
      // Gmail scores emails higher when both html and text are present
      text: options.text || subject,
      headers: {
        "X-Mailer": "VOLGA Contact System",
        "Message-ID": `<${Date.now()}.${Math.random().toString(36).slice(2)}@gmail.com>`
      }
    });

    // Update log with success
    await EmailLog.findByIdAndUpdate(emailLog._id, {
      status: "sent",
      metadata: {
        messageId: info.messageId,
        response: info.response
      }
    });

    return {
      success: true,
      messageId: info.messageId,
      logId: emailLog._id
    };
  } catch (error) {
    console.error("Email send error:", error.message);
    
    // Retry logic for network-related errors
    if (retries > 0 && (
      error.message.includes("ETIMEDOUT") || 
      error.message.includes("ENETUNREACH") || 
      error.message.includes("ECONNRESET") ||
      error.message.includes("Connection timeout")
    )) {
      console.log(`Retrying email send... (${retries} attempts left)`);
      await delay(2000);
      return sendEmail(options, retries - 1);
    }

    // Log the failure
    const emailLog = await EmailLog.create({
      from,
      to: toArray,
      subject,
      message: html,
      type,
      status: "failed",
      errorMessage: error.message,
      contactFormId
    });

    return {
      success: false,
      error: error.message,
      logId: emailLog._id
    };
  }
};

/**
 * Send confirmation email to contact form submitter
 */
export const sendConfirmationEmail = async (contactData, contactFormId) => {
  // Generate a simple ticket number from the contactFormId tail
  const ticketNum = contactFormId
    ? String(contactFormId).slice(-4).toUpperCase()
    : Math.floor(1000 + Math.random() * 9000);

  // Format date
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric"
  });

  // Escape HTML entities in user content to prevent injection
  const esc = (str) =>
    String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const confirmationHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Thank You for Contacting VOLGA</title>
  <!--[if mso]><style>table{border-collapse:collapse;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ECE7DC;-webkit-text-size-adjust:100%;">

  <!-- Preview text -->
  <div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ECE7DC;">
    We've received your message, ${esc(contactData.name)} — here's a copy of what you sent VOLGA.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#ECE7DC;">
    <tr><td align="center" style="padding:36px 16px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:600px;max-width:600px;background-color:#FFFFFF;border-radius:16px;">

        <!-- Top accent stripe -->
        <tr><td style="border-radius:16px 16px 0 0;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td height="5" style="background-color:#F35F37;font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td></tr>
            <tr><td height="5" style="background-color:#DC950A;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr><td height="5" style="background-color:#013350;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td></tr>

        <!-- Logo -->
        <tr><td align="center"
                style="background-color:#FFFFFF;padding:38px 40px 26px;font-family:Arial,Helvetica,sans-serif;
                       font-size:28px;font-weight:900;letter-spacing:3px;color:#013350;">
          VOLGA
          <span style="color:#F35F37;">&#9632;</span>
        </td></tr>

        <!-- Status strip -->
        <tr><td style="background-color:#013350;padding:13px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left"
                  style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.4px;
                         color:#F6F4EF;text-transform:uppercase;font-weight:bold;">
                &#10003;&nbsp; Message Received
              </td>
              <td align="right"
                  style="font-family:'Courier New',Courier,monospace;font-size:11px;
                         letter-spacing:0.5px;color:#DC950A;font-weight:bold;">
                TICKET #FD-${ticketNum}
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:36px 40px 6px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 16px;font-size:21px;line-height:28px;font-weight:bold;color:#013350;">
            Hi ${esc(contactData.name)},
          </p>
          <p style="margin:0 0 8px;font-size:15px;line-height:24px;color:#43525B;">
            Thanks for reaching out. Your inquiry has been logged in our system, and the team is
            already reviewing it &mdash; here&rsquo;s a copy of what you sent us for your records.
          </p>
        </td></tr>

        <!-- Ticket card -->
        <tr><td style="padding:24px 40px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background-color:#FAF8F2;border:1px solid #E7E1D2;border-radius:12px;">

            <!-- Card header -->
            <tr><td style="padding:16px 22px;border-bottom:1px dashed #D8D0BA;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.6px;
                             color:#013350;text-transform:uppercase;font-weight:bold;">
                    Submission Details
                  </td>
                  <td align="right"
                      style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9A9586;">
                    ${dateStr}
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- Fields -->
            <tr><td style="padding:18px 22px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <tr>
                  <td width="34%" valign="top"
                      style="padding:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;
                             letter-spacing:0.8px;color:#9A9586;text-transform:uppercase;">Email</td>
                  <td valign="top"
                      style="padding:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;
                             color:#1E2B33;font-weight:bold;">${esc(contactData.email)}</td>
                </tr>

                ${contactData.company ? `
                <tr>
                  <td width="34%" valign="top"
                      style="padding:0 0 14px;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;
                             font-size:11px;letter-spacing:0.8px;color:#9A9586;text-transform:uppercase;">Company</td>
                  <td valign="top"
                      style="padding:0 0 14px;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;
                             font-size:14px;color:#1E2B33;font-weight:bold;">${esc(contactData.company)}</td>
                </tr>` : ""}

                ${contactData.country ? `
                <tr>
                  <td width="34%" valign="top"
                      style="padding:14px 0;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;
                             font-size:11px;letter-spacing:0.8px;color:#9A9586;text-transform:uppercase;">Country</td>
                  <td valign="top"
                      style="padding:14px 0;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;
                             font-size:14px;color:#1E2B33;font-weight:bold;">${esc(contactData.country)}</td>
                </tr>` : ""}

                ${contactData.serviceInterested ? `
                <tr>
                  <td width="34%" valign="top"
                      style="padding:14px 0;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;
                             font-size:11px;letter-spacing:0.8px;color:#9A9586;text-transform:uppercase;">Service</td>
                  <td valign="top"
                      style="padding:14px 0;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;">
                    <span style="display:inline-block;background-color:#FCEEDA;color:#9A5B0B;font-size:12px;
                                 font-weight:bold;letter-spacing:0.3px;padding:5px 12px;border-radius:999px;">
                      ${esc(contactData.serviceInterested)}
                    </span>
                  </td>
                </tr>` : ""}

                ${contactData.budget ? `
                <tr>
                  <td width="34%" valign="top"
                      style="padding:14px 0;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;
                             font-size:11px;letter-spacing:0.8px;color:#9A9586;text-transform:uppercase;">Budget</td>
                  <td valign="top"
                      style="padding:14px 0;border-top:1px solid #EFEAE0;font-family:Arial,Helvetica,sans-serif;
                             font-size:14px;color:#1E2B33;font-weight:bold;">${esc(contactData.budget)}</td>
                </tr>` : ""}

              </table>
            </td></tr>

            <!-- Message block -->
            <tr><td style="padding:4px 22px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="border-top:1px solid #EFEAE0;">
                <tr><td style="padding:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;
                               letter-spacing:0.8px;color:#9A9586;text-transform:uppercase;">Message</td></tr>
                <tr><td style="padding:8px 16px;background-color:#FFFFFF;border-left:3px solid #F35F37;
                               font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;
                               color:#43525B;font-style:italic;">
                  &ldquo;${esc(contactData.message)}&rdquo;
                </td></tr>
              </table>
            </td></tr>

          </table>
        </td></tr>

        <!-- Response time -->
        <tr><td style="padding:24px 40px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background-color:#013350;border-radius:12px;">
            <tr><td style="padding:18px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle"
                      style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#C9D6DD;">
                    Typical response time
                  </td>
                  <td align="right" valign="middle"
                      style="font-family:Arial,Helvetica,sans-serif;font-size:18px;
                             font-weight:bold;color:#FFFFFF;">
                    24&ndash;48 hrs
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Closing -->
        <tr><td style="padding:24px 40px 36px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#43525B;">
            If anything is urgent in the meantime, just reply directly to this email and a team
            member will pick it up.
          </p>
          <p style="margin:0;font-size:14px;line-height:22px;color:#43525B;">
            Best regards,<br>
            <span style="color:#013350;font-weight:bold;">The VOLGA Team</span>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#013350;border-radius:0 0 16px 16px;padding:22px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center"
                    style="font-family:Arial,Helvetica,sans-serif;font-size:11px;
                           letter-spacing:0.6px;color:#8FA3AF;">
              &copy; ${new Date().getFullYear()} VOLGA &middot; This is an automated confirmation &mdash; no action needed.
            </td></tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;

  return sendEmail({
    to: contactData.email,
    subject: `Your VOLGA inquiry is confirmed`,
    html: confirmationHtml,
    // Plain text version — critical for inbox delivery
    text: `Hi ${contactData.name},

Thanks for reaching out to VOLGA. We have received your inquiry and the team is reviewing it.

--- YOUR SUBMISSION ---
Email: ${contactData.email}${contactData.company ? `\nCompany: ${contactData.company}` : ""}${contactData.country ? `\nCountry: ${contactData.country}` : ""}${contactData.serviceInterested ? `\nService: ${contactData.serviceInterested}` : ""}${contactData.budget ? `\nBudget: ${contactData.budget}` : ""}

Message: ${contactData.message}
-----------------------

We typically respond within 24 to 48 hours. If anything is urgent, just reply to this email and a team member will assist you.

Best regards,
The VOLGA Team
https://volgainfosys.com`,
    contactFormId,
    type: "outgoing"
  });
};

/**
 * Send admin notification email
 */
export const sendAdminNotification = async (contactData, contactFormId) => {
  const adminHtml = `
    <h2>New VOLGA Contact Inquiry</h2>
    <p><strong>Name:</strong> ${contactData.name}</p>
    <p><strong>Email:</strong> ${contactData.email}</p>
    <p><strong>Company:</strong> ${contactData.company || "N/A"}</p>
    <p><strong>Country:</strong> ${contactData.country || "N/A"}</p>
    <p><strong>Service:</strong> ${contactData.serviceInterested || "N/A"}</p>
    <p><strong>Budget:</strong> ${contactData.budget || "N/A"}</p>
    <p><strong>Message:</strong> ${contactData.message}</p>
    
  `;

  return sendEmail({
    to: process.env.EMAIL_USER,
    subject: "New VOLGA Contact Inquiry",
    html: adminHtml,
    contactFormId,
    type: "outgoing"
  });
};

/**
 * Get email logs with filtering
 */
export const getEmailLogs = async (filters = {}) => {
  try {
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.from) query.from = filters.from;
    if (filters.to) query.to = new RegExp(filters.to, "i");
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    return await EmailLog.find(query).sort({ createdAt: -1 }).limit(100);
  } catch (error) {
    console.error("Error fetching email logs:", error.message);
    return [];
  }
};

export default { sendEmail, sendConfirmationEmail, sendAdminNotification, getEmailLogs };
