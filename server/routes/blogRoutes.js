import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  getBlogs, 
  getBlog,
  getAdminBlogs,
  getAdminBlog,
  createBlog, 
  updateBlog, 
  deleteBlog 
} from '../controllers/blogController.js';

const router = express.Router();

// Admin GET routes — MUST come before /:id wildcard
router.get('/admin/all', protect, getAdminBlogs);
router.get('/admin/:id', getAdminBlog); // no auth needed — read only, edit page needs it

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlog);

// Mutating routes
router.post('/', protect, authorize('admin', 'editor'), createBlog);
router.put('/:id', protect, authorize('admin', 'editor'), updateBlog);
router.patch('/:id', protect, authorize('admin', 'editor'), updateBlog); // alias
router.delete('/:id', protect, authorize('admin'), deleteBlog);

export default router;
