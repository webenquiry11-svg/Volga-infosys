import mongoose from "mongoose";
import Admin from "./models/Admin.js";
import dotenv from "dotenv";

dotenv.config();

const resetPassword = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB!");

    const email = "internweb1.star@gmail.com"; // Change this to your email
    const newPassword = "VolgaAdmin123!"; // Change this to your desired new password
    
    console.log("\n🔍 Looking for user:", email);
    const user = await Admin.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found!");
      process.exit(1);
    }

    console.log("✅ Found user:", user.email);
    
    // Set new password
    user.password = newPassword;
    await user.save();
    console.log("\n✅ Password updated successfully!");
    console.log("\n📧 Email:", email);
    console.log("🔑 New Password:", newPassword);
    console.log("\n🎉 Done!");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetPassword();
