import nodemailer from "nodemailer";

// Try port 465 with SSL (works better on hosting providers like Railway)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  family: 4
});

// Verify connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error command:", error.command);
  } else {
    console.log("✅ Email transporter is ready to send emails");
  }
});

export default transporter;  

