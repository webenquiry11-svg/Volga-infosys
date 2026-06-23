import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  place:       { type: String, required: true },
  title:       { type: String, required: true },
  title2:      { type: String, default: "" },
  tag:         { type: String, required: true },
  description: { type: String, required: true },
  image:       { type: String, required: true },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
