// Fix crypto issue on Railway
import crypto from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import autoResponseRoutes from "./routes/autoResponseRoutes.js";
import clientStoryRoutes from "./routes/clientStoryRoutes.js";
import caseStudyRoutes from "./routes/caseStudyRoutes.js";
import industryNewsRoutes from "./routes/industryNewsRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";
import { getPublicStats } from "./controllers/dashboardController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

connectDB();

const app = express();

// Simple health check for Railway
app.get("/health", (req, res) => {
  console.log("✅ Health check hit at:", new Date().toISOString());
  res.status(200).send("OK");
});

// Simple favicon handler to prevent 404s/502s
app.get("/favicon.ico", (req, res) => {
  console.log("✅ Favicon requested");
  res.status(204).send(); // No content
});

app.use(cors({
  origin: function (origin, callback) {
    const allowed = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: "Too many submissions, try again later." } });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts, try again later." }
});
const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, try again later." }
});

// Serve uploaded files (with proper headers for Railway)
app.use("/uploads", (req, res, next) => {
  console.log(`📁 Upload request: ${req.method} ${req.url}`);
  next();
}, express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    // Set proper headers for PDF files to open in browser
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/auth", generalAuthLimiter, authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/client-stories", clientStoryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/industry-news", industryNewsRoutes);
app.use("/api/auto-responses", autoResponseRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.get("/api/stats", getPublicStats);

// Serve admin panel — only accessible at /admin
const adminPath = path.join(__dirname, "admin");
const adminStaticOptions = {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};
app.use(
  "/admin",
  (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  },
  express.static(adminPath, adminStaticOptions)
);
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin", "index.html")));

// Note: Frontend is hosted separately on Vercel, so we don't serve static files here
// Backend only serves API endpoints, uploads, and admin panel


const PORT = process.env.PORT || 5000;

// Add error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  console.error('❌ Error stack:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
  console.log(`📍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📍 Admin panel: http://0.0.0.0:${PORT}/admin`);
  console.log(`✅ Server ready to accept requests!`);
});
