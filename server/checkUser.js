import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const Admin = mongoose.model('Admin', new mongoose.Schema({
  name: String,
  email: String,
  role: String
}));

const user = await Admin.findOne({ email: 'internweb1.star@gmail.com' });
console.log('User data:', user);

await mongoose.disconnect();
