import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../config/multer.js';
import {
  submitApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication
} from '../controllers/jobApplicationController.js';

const router = express.Router();

// Public route - with file upload for resume
router.post('/', upload.single('resume'), submitApplication);

// Protected admin routes
router.get('/', protect, getApplications);
router.get('/:id', protect, getApplication);
router.put('/:id', protect, authorize('admin', 'editor'), updateApplication);
router.patch('/:id', protect, authorize('admin', 'editor'), updateApplication);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

export default router;
