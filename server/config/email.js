import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  maxConnections: 5,
  maxMessages: Infinity,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  dnsTimeout: 10000,
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  family: 4
});

export default transporter;  

