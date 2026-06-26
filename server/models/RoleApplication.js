import mongoose from "mongoose";

const roleApplicationSchema = new mongoose.Schema({
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  requestedRole: {
    type: String,
    enum: ["admin", "editor", "viewer"],
    required: true
  },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  reviewedAt: Date
}, {
  timestamps: true
});

export default mongoose.model("RoleApplication", roleApplicationSchema);