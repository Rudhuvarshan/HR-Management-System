import express from 'express';
const router = express.Router();
import {
  generatePayroll,
  getMyPayroll,
  getAllPayrolls,
  updatePayrollStatus,
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, authorize('Admin', 'HR'), generatePayroll)
  .get(protect, authorize('Admin', 'HR'), getAllPayrolls);

router.get('/my', protect, getMyPayroll);

router.put('/:id/status', protect, authorize('Admin', 'HR'), updatePayrollStatus);

export default router;
