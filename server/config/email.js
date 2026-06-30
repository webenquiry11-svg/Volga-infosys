import nodemailer from "nodemailer";

// Use hardcoded Gmail SMTP IPv4 address to bypass IPv6 issues
// Gmail SMTP IPv4 addresses (these are reliable):
// 74.125.195.108, 74.125.195.109, 173.194.219.108, etc.
const GMAIL_SMTP_IPV4 = "74.125.195.108";

console.log("🔧 Using Gmail SMTP IPv4 address:", GMAIL_SMTP_IPV4);

const transporter = nodemailer.createTransport({
  host: GMAIL_SMTP_IPV4,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    servername: "smtp.gmail.com" // Critical for SSL certificate validation
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000
});

// Verify connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email transporter verification failed:", error);
    console.error("❌ Error code:", error.code);
    console.error("❌ Try different Gmail IPv4: 173.194.219.108, 173.194.219.109, 172.217.197.108, 172.217.197.109");
  } else {
    console.log("✅ Email transporter is ready to send emails");
  }
});

export default transporter;  

