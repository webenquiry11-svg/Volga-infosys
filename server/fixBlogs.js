import "dotenv/config";
import connectDB from "./config/db.js";
import Blog from "./models/Blog.js";

const fixBlogs = async () => {
  try {
    await connectDB();
    
    const blogs = await Blog.find();
    console.log(`Found ${blogs.length} blogs to fix`);
    
    for (const blog of blogs) {
      let updates = {};
      
      // Set coverImage to image if available
      if (!blog.coverImage && blog.image) {
        updates.coverImage = blog.image;
        console.log(`Setting coverImage for: ${blog.title}`);
      }
      // If no coverImage but image exists, use it
      if (blog.image && (!blog.coverImage || blog.coverImage === '')) {
        updates.coverImage = blog.image;
        console.log(`Updating coverImage for: ${blog.title}`);
      }
      
      // Ensure status is published
      if (!blog.status || blog.status !== "published") {
        updates.status = "published";
        console.log(`Setting status to published for: ${blog.title}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await Blog.findByIdAndUpdate(blog._id, updates);
        console.log(`Updated blog: ${blog.title}`);
      }
    }
    
    console.log("✅ Fix complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fix failed:", error);
    process.exit(1);
  }
};

fixBlogs();
