import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const Admin = mongoose.model('Admin', new mongoose.Schema({
  email: String,
  password: String
}));

const newPassword = 'Volga@2024';
const hash = await bcrypt.hash(newPassword, 10);

const result = await Admin.findOneAndUpdate(
  {},
  { password: hash },
  { new: true }
);

console.log('Password reset for:', result.email);
console.log('New password:', newPassword);
await mongoose.disconnect();
