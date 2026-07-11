import JobApplication from '../models/JobApplication.js';
import Job from '../models/Job.js';
import { logActivity } from './dashboardController.js';

// @desc    Submit job application (public)
// @route   POST /api/job-applications
// @access  Public
export const submitApplication = async (req, res) => {
  try {
    const { jobId, ...applicationData } = req.body;
    
    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'open') {
      return res.status(404).json({ success: false, message: 'Job not available' });
    }
    
    const application = await JobApplication.create({ jobId, ...applicationData });
    await logActivity(null, "submit", "jobApplication", application._id, `Application submitted for job: ${job.title}`);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('submitApplication error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all job applications (admin)
// @route   GET /api/job-applications
// @access  Private
export const getApplications = async (req, res) => {
  try {
    const { jobId, status, search } = req.query;
    let query = {};
    
    if (jobId) {
      query.jobId = jobId;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { applicantName: { $regex: search, $options: 'i' } },
        { applicantEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    const applications = await JobApplication.find(query)
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error('getApplications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single job application (admin)
// @route   GET /api/job-applications/:id
// @access  Private
export const getApplication = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('jobId', 'title department');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('getApplication error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update job application (admin) - status, notes, etc.
// @route   PUT/PATCH /api/job-applications/:id
// @access  Private
export const updateApplication = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    const updateData = { ...req.body };
    if (req.body.status && req.body.status !== application.status) {
      updateData.repliedAt = new Date();
      updateData.repliedBy = req.user?._id;
    }
    
    Object.assign(application, updateData);
    await application.save();
    await logActivity(req.user?._id, "update", "jobApplication", application._id, `Updated application for ${application.applicantName}`);
    
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error('updateApplication error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete job application (admin)
// @route   DELETE /api/job-applications/:id
// @access  Private
export const deleteApplication = async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    await logActivity(req.user?._id, "delete", "jobApplication", application._id, `Deleted application for ${application.applicantName}`);
    await application.deleteOne();
    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('deleteApplication error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
