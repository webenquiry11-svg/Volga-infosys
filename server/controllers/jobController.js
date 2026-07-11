import Job from '../models/Job.js';
import { logActivity } from './dashboardController.js';

// @desc    Get all jobs (public - only open)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const { department, location, type, search } = req.query;
    let query = { status: 'open' };
    
    if (department) {
      query.department = department;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    const jobs = await Job.find(query).sort({ featured: -1, order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error('getJobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single job (public)
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.status !== 'open') {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('getJob error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all jobs (admin - all statuses)
// @route   GET /api/jobs/admin/all
// @access  Private
export const getAdminJobs = async (req, res) => {
  try {
    const { status, department, search } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    if (department) {
      query.department = department;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const jobs = await Job.find(query).sort({ featured: -1, order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error('getAdminJobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single job (admin)
// @route   GET /api/jobs/admin/:id
// @access  Private
export const getAdminJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('getAdminJob error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    await logActivity(req.user?._id, "create", "job", job._id, `Created job: ${job.title}`);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('createJob error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update job
// @route   PUT/PATCH /api/jobs/:id
// @access  Private
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    Object.assign(job, req.body);
    await job.save();
    await logActivity(req.user?._id, "update", "job", job._id, `Updated job: ${job.title}`);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('updateJob error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    await logActivity(req.user?._id, "delete", "job", job._id, `Deleted job: ${job.title}`);
    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('deleteJob error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
