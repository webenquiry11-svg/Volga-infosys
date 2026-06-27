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
const email    = 'internweb1.star@gmail.com';
const password = 'Admin@123'; // You can change this later
// ────────────────────────────────────

const exists = await Admin.findOne({ email });
if (exists) {
  console.log('User already exists:', email);
  // Update role to admin if not already
  if (exists.role !== 'admin') {
    await Admin.updateOne({ email }, { role: 'admin' });
    console.log('Updated user to admin role');
  }
} else {
  const hash = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hash, role: 'admin', name: 'Admin User' });
  console.log('New admin created!');
  console.log('Email:   ', email);
  console.log('Password:', password);
}

await mongoose.disconnect();
