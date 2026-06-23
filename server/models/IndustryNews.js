import mongoose from "mongoose";

const industryNewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, default: '' },  // full rich article content
  topic: { type: String, required: true },
  image: { type: String, required: true },
  source: { type: String, default: "Volga Infosys" },
  publishedAt: { type: Date, default: Date.now },
  url: { type: String, default: "" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("IndustryNews", industryNewsSchema);
