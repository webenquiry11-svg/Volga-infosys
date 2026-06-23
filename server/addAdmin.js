import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const Admin = mongoose.model('Admin', new mongoose.Schema({
  email: String,
  password: String
}));

// ── SET YOUR NEW USER DETAILS HERE ──
const email    = 'newadmin@volga.com';
const password = 'NewAdmin@2024';
// ────────────────────────────────────

const exists = await Admin.findOne({ email });
if (exists) {
  console.log('User already exists:', email);
} else {
  const hash = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hash });
  console.log('New admin created!');
  console.log('Email:   ', email);
  console.log('Password:', password);
}

await mongoose.disconnect();
