import "dotenv/config";
import mongoose from "mongoose";
import Project from "./models/Project.js";

const defaultProjects = [
  { place:'United States',  title:'VR MEDICAL',   title2:'TRAINING',        tag:'Virtual Reality',   description:'Full-body surgical simulation for a leading US hospital network. Reduced training costs by 60% and improved retention across 12 departments.',               image:'https://images.unsplash.com/photo-1617802690658-1173a812650d?w=1400&q=80', order: 0 },
  { place:'UAE — Dubai',    title:'AR FURNITURE',  title2:'CONFIGURATOR',    tag:'Augmented Reality', description:'Place and customise furniture in your real space before buying. Deployed across 40+ showrooms for a UAE-based retail chain. 42% fewer returns.',            image:'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1400&q=80', order: 1 },
  { place:'UAE — Dubai',    title:'LUXURY',        title2:'WALKTHROUGH',     tag:'Architecture',      description:'Pre-sale VR tours for a Dubai real estate developer. 40% of units sold before construction even broke ground.',                                             image:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80', order: 2 },
  { place:'Scandinavia',    title:'INDUSTRIAL',    title2:'SAFETY VR',       tag:'XR Training',       description:'Hazardous environment simulation for an oil & gas company in Scandinavia. Zero workplace incidents recorded post-deployment.',                               image:'https://images.unsplash.com/photo-1626379961798-54f819ee896a?w=1400&q=80', order: 3 },
  { place:'United Kingdom', title:'AUTOMOTIVE',    title2:'3D CONFIGURATOR', tag:'3D Visualization',  description:'Real-time car customisation tool for a UK automotive brand. 35% increase in online conversions within the first quarter of launch.',                        image:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1400&q=80', order: 4 },
  { place:'Germany — DACH', title:'VIRTUAL',       title2:'MUSEUM',          tag:'Entertainment',     description:'Digital twin of a historical museum in Germany. Over 100,000 virtual visitors in the first month of launch.',                                               image:'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=1400&q=80', order: 5 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Project.countDocuments();
    if (existing >= defaultProjects.length) {
      console.log(`Database already has ${existing} projects. Skipping seed.`);
      process.exit(0);
    }

    await Project.deleteMany({});
    await Project.insertMany(defaultProjects);
    console.log('✅ Seeded 6 default projects');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
