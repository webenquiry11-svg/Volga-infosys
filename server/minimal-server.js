import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Health check
app.get("/health", (req, res) => {
  console.log("✅ HEALTH CHECK PASSED!");
  res.send("OK");
});

// Root
app.get("/", (req, res) => {
  console.log("✅ ROOT HIT!");
  res.send("<h1>VOLGA SERVER IS WORKING!</h1>");
});

// Admin panel
app.use("/admin", express.static(path.join(__dirname, "admin")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 MINIMAL SERVER RUNNING ON PORT", PORT);
  console.log("📍 Health: http://0.0.0.0:" + PORT + "/health");
});
