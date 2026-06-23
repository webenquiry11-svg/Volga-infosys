import mongoose from "mongoose";

const clientStorySchema = new mongoose.Schema({
  industry:       { type: String, default: "" },
  clientName:     { type: String, required: true },
  clientRole:     { type: String, default: "" },
  testimonial:    { type: String, required: true },
  image:          { type: String, default: "" },
  avatar:         { type: String, default: "" },
  impact:         { type: [String], default: [] },
  order:          { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("ClientStory", clientStorySchema);
