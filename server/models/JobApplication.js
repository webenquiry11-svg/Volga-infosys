import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  applicantPhone: { type: String },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  portfolioUrl: { type: String },
  linkedinUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'interview', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: { type: String }, // Internal notes from admin
  repliedAt: Date,
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

export default mongoose.model('JobApplication', jobApplicationSchema);
