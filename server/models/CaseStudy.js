import mongoose from "mongoose";

const metricSchema = new mongoose.Schema({
  value: { type: String, default: "" },
  label: { type: String, default: "" }
}, { _id: false });

const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  image: { type: String, required: true },
  year: { type: String, default: "" },
  metrics: { type: [metricSchema], default: [] },
  author: { type: String, default: "Volga Infosys" },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("CaseStudy", caseStudySchema);
