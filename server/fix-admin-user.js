import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/volga");
    console.log("✅ Connected to MongoDB");

    // Find all admin users
    const users = await Admin.find({});
    console.log(`👤 Found ${users.length} user(s) total`);

    let fixed = 0;
    for (const user of users) {
      if (!user.name) {
        user.name = user.email.split("@")[0]; // Use part of email as name
        await user.save();
        console.log(`✅ Fixed user: ${user.email} → name set to "${user.name}"`);
        fixed++;
      } else {
        console.log(`✅ User already has name: ${user.email} (${user.name})`);
      }
    }

    if (fixed === 0) {
      console.log("ℹ️ No users needed fixing!");
    } else {
      console.log(`✅ Fixed ${fixed} user(s)!`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

fixAdmin();
