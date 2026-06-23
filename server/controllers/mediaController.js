import Media from '../models/Media.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @desc    Upload media
// @route   POST /api/upload
// @access  Private
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { filename, mimetype, size } = req.file;
    const url = `/uploads/${filename}`;

    const media = await Media.create({
      filename,
      url,
      size,
      mimetype,
      uploadedBy: req.user._id
    });

    // Return both the media data and the url for CKEditor
    res.status(201).json({ 
      success: true, 
      data: media,
      url: url // CKEditor expects a 'url' field
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all media
// @route   GET /api/media
// @access  Private
export const getMedia = async (req, res) => {
  try {
    const media = await Media.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'email');
    
    res.status(200).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await media.deleteOne();

    res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
