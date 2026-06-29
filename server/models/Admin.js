import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  name: { type: String, default: "Admin User" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "editor", "viewer"],
    default: "viewer"
  },
  permissions: {
    type: [String],
    default: []
  },
  profilePicture: { type: String, default: "" },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date
}, {
  timestamps: true
});

adminSchema.pre("save", async function () {
  console.log("Pre-save hook triggered. Is password modified?", this.isModified("password"));
  if (this.isModified("password")) {
    console.log("Hashing password...");
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Password hashed successfully");
  }
});

adminSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("Admin", adminSchema);
