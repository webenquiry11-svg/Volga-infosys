import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  ip: { type: String },
  userAgent: { type: String },
  deviceName: { type: String },
  lastActive: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create an index to auto-remove sessions after the absolute expiry date (if set)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $exists: true } } });

export default mongoose.model("Session", sessionSchema);
