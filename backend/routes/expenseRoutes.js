import express from 'express';
const router = express.Router();
import {
  submitExpense,
  getMyExpenses,
  getAllExpenses,
  updateExpenseStatus,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

router.route('/')
  .post(protect, upload.single('receipt'), submitExpense)
  .get(protect, authorize('Manager', 'Admin', 'HR'), getAllExpenses);

router.get('/my', protect, getMyExpenses);

router.put('/:id/status', protect, authorize('Manager', 'Admin', 'HR'), updateExpenseStatus);

export default router;
