
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import 'dotenv/config';

async function testFlow() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongo connected');

    // Step 1: Find a test user or create one
    const testEmail = 'test@volga.com';
    let testUser = await Admin.findOne({ email: testEmail });
    if (!testUser) {
      testUser = await Admin.create({
        name: 'Test User',
        email: testEmail,
        password: 'oldpassword123',
        role: 'editor'
      });
      console.log('Created test user:', testEmail);
    } else {
      console.log('Found test user:', testEmail);
    }

    // Step 2: Simulate forgot password (generate token)
    const crypto = await import('crypto');
    const resetToken = crypto.default.randomBytes(20).toString('hex');
    testUser.resetPasswordToken = crypto.default.createHash('sha256').update(resetToken).digest('hex');
    testUser.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await testUser.save();
    console.log('Set reset token for user');
    console.log('Raw token:', resetToken);
    console.log('Hashed token:', testUser.resetPasswordToken);

    // Step 3: Simulate reset password (set new password)
    const newPassword = 'newpassword123';
    testUser.password = newPassword;
    testUser.resetPasswordToken = undefined;
    testUser.resetPasswordExpire = undefined;
    await testUser.save();
    console.log('Set new password to:', newPassword);

    // Step 4: Test password match
    const matches = await testUser.matchPassword(newPassword);
    console.log('Does new password match?', matches);

    if (matches) {
      console.log('✅ ALL GOOD! Password reset works!');
    } else {
      console.log('❌ PROBLEM! Password does NOT match!');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testFlow();
