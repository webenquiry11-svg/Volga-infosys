import "dotenv/config";
import mongoose from "mongoose";
import Blog from "./models/Blog.js";

const defaultBlogs = [
  {
    title: 'How Industry Collaboration Helps Universities Build Innovation Ecosystems',
    excerpt: 'Discover how partnerships between universities and industry leaders are fostering the next generation of XR innovators.',
    content: '',
    category: 'Virtual Reality',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9a1?w=1400&q=80',
    author: 'Volga Infosys',
    readTime: '7 min read',
    featured: true,
    order: 0,
  },
  {
    title: 'Exploring Commercial Real Estate: Virtual Reality\'s Big Impact',
    excerpt: 'How VR walkthroughs are transforming the way properties are bought, sold, and rented in the commercial real estate sector.',
    content: '',
    category: 'Virtual Reality',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80',
    author: 'Volga Infosys',
    readTime: '5 min read',
    featured: false,
    order: 1,
  },
  {
    title: 'The Future of Virtual Reality: Transforming Industries Beyond Gaming',
    excerpt: 'Virtual Reality (VR) is no longer limited to gaming and entertainment. Over the last few years, VR technology has evolved into a powerful tool that is reshaping industries, improving training systems, enhancing customer experiences, and creating immersive digital environments.',
    content: '',
    category: 'Industry',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=1400&q=80',
    author: 'Volga Infosys',
    readTime: '12 min read',
    featured: false,
    order: 2,
  },
  {
    title: 'Extended Reality (XR) - Industry Overview',
    excerpt: 'Extended Reality is the industry sector acting as an umbrella for VR, AR, and MR technologies. The ecosystem is growing, and more startups are coming to life, but is it the right to invest?',
    content: '',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&q=80',
    author: 'Volga Infosys',
    readTime: '5 min read',
    featured: false,
    order: 3,
  },
  {
    title: 'AIR (Augmented Intelligent Reality): when AI & AR come together',
    excerpt: 'AI AR AIR Augmented Intelligent Reality Augmented Reality',
    content: '',
    category: 'Augmented Reality',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&q=80',
    author: 'Volga Infosys',
    readTime: '5 min read',
    featured: false,
    order: 4,
  },
  {
    title: 'How Virtual Reality is Redefining Digital Experiences',
    excerpt: 'The digital world is evolving rapidly, and Virtual Reality (VR) is becoming one of the most transformative technologies of this generation. What once seemed like science fiction is now helping businesses create immersive experiences that improve communication, training, education, and customer engagement.',
    content: '',
    category: 'Virtual Reality',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&q=80',
    author: 'Volga Infosys',
    readTime: '8 min read',
    featured: false,
    order: 5,
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await Blog.countDocuments();
    if (existing >= defaultBlogs.length) {
      console.log(`Database already has ${existing} blogs. Skipping seed.`);
      process.exit(0);
    }

    await Blog.deleteMany({});
    await Blog.insertMany(defaultBlogs);
    console.log('✅ Seeded 6 default blogs');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
