import mongoose from "mongoose";

const autoResponseSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true
    },
    responseType: {
      type: String,
      enum: ["simple", "keyword-based"],
      default: "simple"
    },
    // For simple auto-reply
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    // For keyword-based responses
    keywords: [{
      keyword: String,
      response: String
    }],
    // Configuration
    respondToAllEmails: {
      type: Boolean,
      default: false
    },
    respondToContactForm: {
      type: Boolean,
      default: true
    },
    respondOnlyOnce: {
      type: Boolean,
      default: true
    },
    delaySeconds: {
      type: Number,
      default: 0 // seconds to delay auto-response
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("AutoResponse", autoResponseSchema);
