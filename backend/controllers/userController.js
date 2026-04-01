import User from '../models/User.js';

// @desc    Get all users (employees)
// @route   GET /api/users
// @access  Private/HR/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/HR/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, managerId, skills, contactInfo } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Welcome123', // Default pass
      role,
      department,
      designation,
      managerId,
      skills,
      contactInfo,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/HR/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.department = req.body.department || user.department;
      user.designation = req.body.designation || user.designation;
      user.managerId = req.body.managerId || user.managerId;
      user.skills = req.body.skills || user.skills;
      user.contactInfo = req.body.contactInfo || user.contactInfo;

      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/users/:id/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && req.file) {
      user.avatar = req.file.path; // Cloudinary URL
      await user.save();
      res.json({ message: 'Avatar uploaded', avatarUrl: user.avatar });
    } else {
      res.status(404);
      throw new Error('User not found or file missing');
    }
  } catch (error) {
    next(error);
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser, uploadAvatar };
