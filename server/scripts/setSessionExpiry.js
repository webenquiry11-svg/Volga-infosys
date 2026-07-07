import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Session from '../models/Session.js';
import connectDB from '../config/db.js';

dotenv.config();

async function run() {
  await connectDB();
  const ABSOLUTE_TTL_MS = parseInt(process.env.ABSOLUTE_TTL_MS || String(7 * 24 * 60 * 60 * 1000));
  const sessions = await Session.find({ expiresAt: { $exists: false } });
  console.log(`Found ${sessions.length} sessions without expiresAt`);
  for (const s of sessions) {
    s.expiresAt = new Date(s.createdAt.getTime() + ABSOLUTE_TTL_MS);
    await s.save();
  }
  console.log('Done updating sessions');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
