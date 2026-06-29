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
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    // and any origin in production since frontend is on Vercel
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: "Too many submissions, try again later." } });
const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 500, // Increased limit
  message: { success: false, message: "Too many login attempts, try again later." } 
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/client-stories", clientStoryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/case-studies", caseStudyRoutes);
app.use("/api/industry-news", industryNewsRoutes);
app.use("/api/auto-responses", autoResponseRoutes);
app.use("/api/media", mediaRoutes);
app.get("/api/stats", getPublicStats);

// Serve admin panel — only accessible at /admin
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin", "index.html")));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../client")));

// Fallback — serve index.html for any unmatched route
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});


const PORT = process.env.PORT || 5000;

// Add error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
  console.log(`📍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📍 Admin panel: http://0.0.0.0:${PORT}/admin`);
  console.log(`✅ Server ready to accept requests!`);
});
