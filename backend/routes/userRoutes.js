import express from 'express';
const router = express.Router();
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

router
  .route('/')
  .get(protect, authorize('Admin', 'HR', 'Manager'), getUsers)
  .post(protect, authorize('Admin', 'HR'), createUser);

router
  .route('/:id')
  .get(protect, getUserById)
  .put(protect, authorize('Admin', 'HR'), updateUser)
  .delete(protect, authorize('Admin', 'HR'), deleteUser);

router.post('/:id/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
