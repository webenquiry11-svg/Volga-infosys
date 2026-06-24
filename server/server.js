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

// Ensure OPTIONS preflight requests are handled
app.options("*", cors());
app.use(express.json());

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: "Too many submissions, try again later." } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
