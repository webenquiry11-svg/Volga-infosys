import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true }, // e.g., "Remote", "Hybrid", "On-site"
  type: { type: String, required: true }, // e.g., "Full-time", "Part-time", "Contract"
  salary: { type: String, required: true }, // e.g., "$80k - $100k"
  department: { type: String, required: true }, // e.g., "Engineering", "Design", "Marketing"
  description: { type: String, required: true },
  requirements: { type: [String], required: true }, // Array of bullet points
  responsibilities: { type: [String], required: true }, // Array of bullet points
  status: {
    type: String,
    enum: ['draft', 'open', 'closed'],
    default: 'open'
  },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  applyLink: { type: String } // Optional, if we need an external link
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
