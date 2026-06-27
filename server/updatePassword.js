import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const Admin = mongoose.model('Admin', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}));

const email = 'internweb1.star@gmail.com';
const newPassword = 'Admin@123';

const user = await Admin.findOne({ email });
if (!user) {
  console.log('User not found');
} else {
  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  await user.save();
  console.log('Password updated successfully!');
  console.log('Email:    ', email);
  console.log('Password: ', newPassword);
}

await mongoose.disconnect();
