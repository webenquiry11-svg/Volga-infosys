import mongoose from "mongoose";

const passwordChangeRequestSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    processedAt: Date,
    tempPassword: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PasswordChangeRequest", passwordChangeRequestSchema);
