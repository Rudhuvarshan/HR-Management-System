import Performance from '../models/Performance.js';

// @desc    Create/Assign Goal
// @route   POST /api/performance
// @access  Private/Manager/HR/Admin
const createGoal = async (req, res, next) => {
  try {
    const { employeeId, title, description, dueDate } = req.body;

    const goal = await Performance.create({
      employeeId,
      title,
      description,
      dueDate,
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee's own goals
// @route   GET /api/performance/my
// @access  Private
const getMyGoals = async (req, res, next) => {
  try {
    const goals = await Performance.find({ employeeId: req.user._id }).sort('dueDate');
    res.json(goals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Goals (Admin/HR)
// @route   GET /api/performance
// @access  Private/HR/Admin
const getAllGoals = async (req, res, next) => {
  try {
    const goals = await Performance.find({}).populate('employeeId', 'name email').sort('-createdAt');
    res.json(goals);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Goal progress / Self Review
// @route   PUT /api/performance/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Performance.findById(req.params.id);

    if (goal) {
      if (goal.employeeId.toString() !== req.user._id.toString() && req.user.role === 'Employee') {
        res.status(403);
        throw new Error('Not authorized to update this goal');
      }

      goal.status = req.body.status || goal.status;
      goal.selfReview = req.body.selfReview || goal.selfReview;
      
      const updatedGoal = await goal.save();
      res.json(updatedGoal);
    } else {
      res.status(404);
      throw new Error('Goal not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Manager review and rating
// @route   PUT /api/performance/:id/review
// @access  Private/Manager/HR/Admin
const reviewGoal = async (req, res, next) => {
  try {
    const { managerFeedback, rating } = req.body;
    const goal = await Performance.findById(req.params.id);

    if (goal) {
      goal.managerFeedback = managerFeedback;
      goal.rating = rating;
      
      const updatedGoal = await goal.save();
      res.json(updatedGoal);
    } else {
      res.status(404);
      throw new Error('Goal not found');
    }
  } catch (error) {
    next(error);
  }
};

export { createGoal, getMyGoals, getAllGoals, updateGoal, reviewGoal };
