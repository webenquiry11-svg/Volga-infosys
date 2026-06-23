import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    subject: {
      type: String
    },
    message: {
      type: String
    },
    type: {
      type: String,
      enum: ["outgoing", "incoming", "auto-response"],
      required: true
    },
    status: {
      type: String,
      enum: ["sent", "pending", "failed", "received"],
      default: "pending"
    },
    contactFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact"
    },
    autoResponseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutoResponse"
    },
    errorMessage: {
      type: String
    },
    metadata: {
      type: Object,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("EmailLog", emailLogSchema);
