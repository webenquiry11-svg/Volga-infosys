import Blog from '../models/Blog.js';
import { logActivity } from './dashboardController.js';

// @desc    Get all blogs (public - only published)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    
    // Public route only gets published posts, and only those whose publishAt <= now or null
    query.status = 'published';
    query.$or = [
      { publishAt: { $exists: false } },
      { publishAt: null },
      { publishAt: { $lte: new Date() } }
    ];
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    const blogs = await Blog.find(query).sort({ featured: -1, order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single blog (public)
// @route   GET /api/blogs/:id
// @access  Public
export const getBlog = async (req, res) => {
  try {
    let blog;
    
    // Try by ID first
    blog = await Blog.findById(req.params.id);
    
    // If not found, try by slug
    if (!blog) {
      blog = await Blog.findOne({ slug: req.params.id });
    }
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    // Check if it's published and available
    if (blog.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    // Check publishAt scheduling
    if (blog.publishAt && new Date(blog.publishAt) > new Date()) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single blog (admin - any status)
// @route   GET /api/blogs/admin/:id
// @access  Private
export const getAdminBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      blog = await Blog.findOne({ slug: req.params.id });
    }
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all blogs (admin - all statuses)
// @route   GET /api/blogs/admin/all
// @access  Private
export const getAdminBlogs = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    const blogs = await Blog.find(query).sort({ featured: -1, order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      coverImage: req.body.coverImage || req.body.image
    };
    const blog = await Blog.create(blogData);
    await logActivity(req.user?._id, "create", "blog", blog._id, `Created blog: ${blog.title}`);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('createBlog error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update blog
// @route   PUT/PATCH /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (req.body.image && !req.body.coverImage) {
      blogData.coverImage = req.body.image;
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Use save() so the pre-save slug hook runs correctly when title changes
    Object.assign(blog, blogData);
    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('updateBlog error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    await logActivity(req.user?._id, "delete", "blog", blog._id, `Deleted blog: ${blog.title}`);
    await blog.deleteOne();
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('deleteBlog error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Duplicate blog
// @route   POST /api/blogs/:id/duplicate
// @access  Private
export const duplicateBlog = async (req, res) => {
  try {
    const source = await Blog.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Blog not found' });

    const { _id, slug, createdAt, updatedAt, __v, ...data } = source.toObject();
    const copy = await Blog.create({
      ...data,
      title: `Copy of ${data.title}`,
      status: 'draft',
      featured: false,
    });
    await logActivity(req.user?._id, "duplicate", "blog", copy._id, `Duplicated blog: ${source.title}`);
    res.status(201).json({ success: true, data: copy });
  } catch (error) {
    console.error('duplicateBlog error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
