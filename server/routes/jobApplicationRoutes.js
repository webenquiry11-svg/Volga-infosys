import express from 'express';
import multer from 'multer';
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

// Wrap multer so file-size / type errors return clean JSON instead of crashing
function uploadResume(req, res, next) {
  upload.single('resume')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum resume size is 10 MB.' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    // fileFilter rejection or other error
    return res.status(400).json({ success: false, message: err.message || 'Invalid file type.' });
  });
}

// Public route - with file upload for resume
router.post('/', uploadResume, submitApplication);

// Protected admin routes
router.get('/', protect, getApplications);
router.get('/:id', protect, getApplication);
router.put('/:id', protect, authorize('admin', 'editor'), updateApplication);
router.patch('/:id', protect, authorize('admin', 'editor'), updateApplication);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

export default router;
