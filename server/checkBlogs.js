import "dotenv/config";
import connectDB from "./config/db.js";
import Blog from "./models/Blog.js";

const checkBlogs = async () => {
  try {
    await connectDB();
    
    const blogs = await Blog.find();
    console.log(`Found ${blogs.length} blogs:`);
    blogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title}`);
      console.log('   Fields:', Object.keys(blog.toObject()));
      console.log('   Data:', JSON.stringify(blog.toObject(), (key, value) => {
        if (key === 'content') return value ? '[content]' : value;
        return value;
      }, 2));
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkBlogs();
