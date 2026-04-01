import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Create a Job Posting
// @route   POST /api/recruitment/jobs
// @access  Private/HR/Admin
const createJob = async (req, res, next) => {
  try {
    const { title, department, description, requirements } = req.body;

    const job = await Job.create({
      title,
      department,
      description,
      requirements,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Jobs
// @route   GET /api/recruitment/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'Open' }).sort('-postedDate');
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a Job
// @route   POST /api/recruitment/applications
// @access  Public
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, applicantName, email, coverLetter } = req.body;
    let resumeUrl = '';

    if (req.file) {
      resumeUrl = req.file.path; // Cloudinary
    } else {
      res.status(400);
      throw new Error('Resume file is required');
    }

    const application = await Application.create({
      jobId,
      applicantName,
      email,
      resumeUrl,
      coverLetter,
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Applications for a Job
// @route   GET /api/recruitment/jobs/:id/applications
// @access  Private/HR/Admin
const getApplicationsForJob = async (req, res, next) => {
  try {
    const applications = await Application.find({ jobId: req.params.id }).sort('-createdAt');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Application Status
// @route   PUT /api/recruitment/applications/:id/status
// @access  Private/HR/Admin
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (application) {
      application.status = status;
      const updatedApp = await application.save();
      res.json(updatedApp);
    } else {
      res.status(404);
      throw new Error('Application not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Close a Job Opening
// @route   PUT /api/recruitment/jobs/:id/close
// @access  Private/HR/Admin
const closeJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      job.status = 'Closed';
      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404);
      throw new Error('Job not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Job Opening
// @route   DELETE /api/recruitment/jobs/:id
// @access  Private/HR/Admin
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (job) {
      await Application.deleteMany({ jobId: req.params.id });
      res.json({ message: 'Job removed' });
    } else {
      res.status(404);
      throw new Error('Job not found');
    }
  } catch (error) {
    next(error);
  }
};

export { createJob, getJobs, applyForJob, getApplicationsForJob, updateApplicationStatus, closeJob, deleteJob };
