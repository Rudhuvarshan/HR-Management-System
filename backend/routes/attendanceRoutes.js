import express from 'express';
const router = express.Router();
import {
  clockIn,
  clockOut,
  getAttendanceHistory,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/clockin', protect, clockIn);
router.post('/clockout', protect, clockOut);
router.get('/history/:id', protect, getAttendanceHistory);

export default router;
