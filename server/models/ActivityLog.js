import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  action:  { type: String, required: true },
  entity:  { type: String, required: true },
  entityId:{ type: mongoose.Schema.Types.ObjectId },
  details: { type: String, default: "" },
}, { timestamps: true });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;
