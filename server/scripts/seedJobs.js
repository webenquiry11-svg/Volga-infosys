import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const sampleJobs = [
  {
    title: "Senior Unity Developer",
    location: "Remote / Hybrid",
    type: "Full-time",
    salary: "$80k - $120k",
    department: "Engineering",
    description: "Join our team to build immersive AR/VR experiences that push the boundaries of technology. You'll work on cutting-edge projects for enterprise clients.",
    requirements: [
      "5+ years of Unity development experience",
      "Proficiency in C# and .NET",
      "Strong understanding of 3D math and graphics",
      "Experience with AR/VR platforms (Oculus, HTC Vive, ARKit, ARCore)",
      "Portfolio of shipped projects"
    ],
    responsibilities: [
      "Develop and maintain Unity applications",
      "Collaborate with designers and artists to implement features",
      "Optimize performance for target platforms",
      "Mentor junior developers"
    ],
    status: "open",
    featured: true,
    order: 0
  },
  {
    title: "3D Artist",
    location: "On-site",
    type: "Full-time",
    salary: "$60k - $90k",
    department: "Design",
    description: "Create stunning 3D assets for our AR/VR experiences. You'll work closely with the development team to bring our visions to life.",
    requirements: [
      "3+ years of 3D modeling experience",
      "Proficiency in Blender, Maya, or 3ds Max",
      "Experience with texturing and lighting",
      "Understanding of game engine asset pipelines"
    ],
    responsibilities: [
      "Create high-quality 3D models and textures",
      "Optimize assets for real-time rendering",
      "Collaborate with art direction on visual style",
      "Maintain asset library"
    ],
    status: "open",
    featured: false,
    order: 1
  },
  {
    title: "UX Designer",
    location: "Hybrid",
    type: "Full-time",
    salary: "$70k - $100k",
    department: "Design",
    description: "Design intuitive user experiences for our immersive applications. You'll conduct user research and create wireframes and prototypes.",
    requirements: [
      "3+ years of UX design experience",
      "Experience designing for AR/VR or spatial computing",
      "Proficiency in Figma or similar tools",
      "Strong portfolio of UX work"
    ],
    responsibilities: [
      "Conduct user research and testing",
      "Create wireframes, prototypes, and user flows",
      "Collaborate with product and engineering teams",
      "Iterate on designs based on feedback"
    ],
    status: "open",
    featured: true,
    order: 2
  }
];

async function seedJobs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Job.deleteMany({});
    console.log('Deleted existing jobs');

    const jobs = await Job.create(sampleJobs);
    console.log('Sample jobs created:', jobs.length);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
}

seedJobs();