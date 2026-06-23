import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import ClientStory from "./models/ClientStory.js";

await connectDB();

const clientStories = [
  {
    industry: "Healthcare",
    clientName: "Dr. Sarah Mitchell",
    clientRole: "Chief Medical Officer, Mayo Clinic",
    testimonial: "Volga XR transformed how our surgeons train. We cut training time by 40% and improved surgical outcomes measurably.",
    image: "https://images.unsplash.com/photo-1576091160550-112169f1122d?w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    impact: ["40% faster training", "Improved outcomes"]
  },
  {
    industry: "Manufacturing",
    clientName: "Klaus Bauer",
    clientRole: "VP of Design Innovation, BMW Group",
    testimonial: "We cut 6 months off our design cycle and saved $18M in prototype costs in year one. It's not just a tool — it's a new way of creating cars.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    impact: ["$18M savings", "6 months faster"]
  },
  {
    industry: "Retail",
    clientName: "Emma Thompson",
    clientRole: "VP of Digital Experience, IKEA",
    testimonial: "Our customers love the AR configurator. Online-to-store conversion jumped 35%, and returns dropped significantly.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    impact: ["35% higher conversion", "Fewer returns"]
  },
  {
    industry: "Education",
    clientName: "Prof. James Chen",
    clientRole: "Dean of Engineering, MIT",
    testimonial: "Our engineering students now have access to immersive lab simulations. Learning outcomes improved 28% across the board.",
    image: "https://images.unsplash.com/photo-1516534775068-bb57d782e330?w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    impact: ["28% better outcomes", "Enhanced engagement"]
  },
  {
    industry: "Energy",
    clientName: "Marcus Johnson",
    clientRole: "Head of Training, Shell",
    testimonial: "VR safety training is now mandatory in our offshore operations. We've seen a 52% reduction in on-site incidents.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1507539066556-3a37ad25520a?w=100&q=80",
    impact: ["52% fewer incidents", "Mandatory training"]
  },
  {
    industry: "Real Estate",
    clientName: "Linda Rodriguez",
    clientRole: "CEO, JLL Innovation Lab",
    testimonial: "Virtual property tours increased qualified leads by 47%. International clients now close deals 30% faster.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    impact: ["47% more leads", "30% faster closes"]
  }
];

try {
  await ClientStory.deleteMany({});
  const inserted = await ClientStory.insertMany(clientStories);
  console.log(`✅ Seeded ${inserted.length} client stories`);
  process.exit(0);
} catch (err) {
  console.error("❌ Seed failed:", err);
  process.exit(1);
}
