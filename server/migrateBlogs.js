import "dotenv/config";
import connectDB from "./config/db.js";
import Blog from "./models/Blog.js";
import slugify from "./utils/slugify.js";

const migrateBlogs = async () => {
  try {
    await connectDB();
    
    const blogs = await Blog.find();
    console.log(`Found ${blogs.length} blogs to migrate`);
    
    for (const blog of blogs) {
      let updates = {};
      
      // Add coverImage if missing
      if (!blog.coverImage && blog.image) {
        updates.coverImage = blog.image;
      }
      
      // Add status if missing
      if (!blog.status) {
        updates.status = "published";
      }
      
      // Generate slug if missing
      if (!blog.slug) {
        let baseSlug = slugify(blog.title);
        let slug = baseSlug;
        let counter = 1;
        
        // Check for unique slug
        while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        updates.slug = slug;
      }
      
      // Update the blog
      if (Object.keys(updates).length > 0) {
        await Blog.findByIdAndUpdate(blog._id, updates);
        console.log(`Updated blog: ${blog.title}`);
      }
    }
    
    console.log("✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateBlogs();
