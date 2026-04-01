import express from 'express';
const router = express.Router();
import {
  createGoal,
  getMyGoals,
  getAllGoals,
  updateGoal,
  reviewGoal,
} from '../controllers/performanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, authorize('Manager', 'HR', 'Admin'), createGoal)
  .get(protect, authorize('Manager', 'HR', 'Admin'), getAllGoals);

router.get('/my', protect, getMyGoals);

router.put('/:id', protect, updateGoal);
router.put('/:id/review', protect, authorize('Manager', 'HR', 'Admin'), reviewGoal);

export default router;
