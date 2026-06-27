import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const Admin = mongoose.model('Admin', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}));

// Update both users to admin
await Admin.updateMany(
  { email: { $in: ['internweb1.star@gmail.com', 'newadmin@volga.com'] } },
  { role: 'admin' }
);

console.log('Updated all users to admin role!');

const users = await Admin.find();
console.log('Current users:', users);

await mongoose.disconnect();
