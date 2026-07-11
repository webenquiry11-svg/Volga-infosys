import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  submitApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication
} from '../controllers/jobApplicationController.js';

const router = express.Router();

// Public route
router.post('/', submitApplication);

// Protected admin routes
router.get('/', protect, getApplications);
router.get('/:id', protect, getApplication);
router.put('/:id', protect, authorize('admin', 'editor'), updateApplication);
router.patch('/:id', protect, authorize('admin', 'editor'), updateApplication);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

export default router;
