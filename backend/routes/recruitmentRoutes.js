import express from 'express';
const router = express.Router();
import {
  createJob,
  getJobs,
  applyForJob,
  getApplicationsForJob,
  updateApplicationStatus,
  closeJob,
  deleteJob
} from '../controllers/recruitmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

// Jobs
router.route('/jobs')
  .post(protect, authorize('Admin', 'HR'), createJob)
  .get(getJobs); // Public visibility

router.route('/jobs/:id')
  .delete(protect, authorize('Admin', 'HR'), deleteJob);

router.put('/jobs/:id/close', protect, authorize('Admin', 'HR'), closeJob);

router.get('/jobs/:id/applications', protect, authorize('Admin', 'HR'), getApplicationsForJob);

// Applications
router.post('/applications', upload.single('resume'), applyForJob); // Public can apply
router.put('/applications/:id/status', protect, authorize('Admin', 'HR'), updateApplicationStatus);

export default router;
