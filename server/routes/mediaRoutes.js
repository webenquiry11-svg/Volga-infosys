import express from 'express';
import upload from '../config/multer.js';
import {protect} from '../middleware/auth.js';
import { 
  uploadMedia, 
  getMedia, 
  deleteMedia 
} from '../controllers/mediaController.js';

const router = express.Router();

router.route('/')
  .get(protect, getMedia);

router.route('/upload')
  .post(protect, upload.single('file'), uploadMedia);

router.route('/:id')
  .delete(protect, deleteMedia);

export default router;
