import express from 'express';
const router = express.Router();
import {
  applyLeave,
  getMyLeaves,
  getManagerLeaves,
  updateLeaveStatus,
  getAllLeaves,
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, applyLeave)
  .get(protect, authorize('Admin', 'HR'), getAllLeaves);

router.get('/my', protect, getMyLeaves);
router.get('/manager', protect, authorize('Manager', 'Admin', 'HR'), getManagerLeaves);

router.put('/:id/status', protect, authorize('Manager', 'Admin', 'HR'), updateLeaveStatus);

export default router;
