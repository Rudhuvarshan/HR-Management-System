import Leave from '../models/Leave.js';

// @desc    Apply for Leave
// @route   POST /api/leave
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, managerId } = req.body;

    const leave = await Leave.create({
      employeeId: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      managerId,
    });

    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Leaves
// @route   GET /api/leave/my
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id }).sort('-createdAt');
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Leaves for Manager Approval
// @route   GET /api/leave/manager
// @access  Private/Manager
const getManagerLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ managerId: req.user._id }).populate('employeeId', 'name email');
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Leave Status (Approve/Reject)
// @route   PUT /api/leave/:id/status
// @access  Private/Manager/HR/Admin
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);

    if (leave) {
      leave.status = status;
      const updatedLeave = await leave.save();
      res.json(updatedLeave);
    } else {
      res.status(404);
      throw new Error('Leave request not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Leaves (HR/Admin)
// @route   GET /api/leave
// @access  Private/HR/Admin
const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({}).populate('employeeId', 'name email').sort('-createdAt');
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};


export { applyLeave, getMyLeaves, getManagerLeaves, updateLeaveStatus, getAllLeaves };
