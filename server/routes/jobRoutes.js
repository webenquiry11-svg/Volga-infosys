import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getJobs,
  getJob,
  getAdminJobs,
  getAdminJob,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';

const router = express.Router();

// Admin routes first
router.get('/admin/all', protect, getAdminJobs);
router.get('/admin/:id', getAdminJob);

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes
router.post('/', protect, authorize('admin', 'editor'), createJob);
router.put('/:id', protect, authorize('admin', 'editor'), updateJob);
router.patch('/:id', protect, authorize('admin', 'editor'), updateJob);
router.delete('/:id', protect, authorize('admin'), deleteJob);

export default router;
