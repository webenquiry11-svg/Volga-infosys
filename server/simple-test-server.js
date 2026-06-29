import express from "express";

const app = express();

app.get("/health", (req, res) => {
  console.log("✅ Health check hit!");
  res.send("OK - Server is alive!");
});

app.get("/", (req, res) => {
  console.log("✅ Root path hit!");
  res.send("VOLGA SERVER IS RUNNING!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}, bound to 0.0.0.0`);
});
