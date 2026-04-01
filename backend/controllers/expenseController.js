import Expense from '../models/Expense.js';

// @desc    Submit an expense claim
// @route   POST /api/expenses
// @access  Private
const submitExpense = async (req, res, next) => {
  try {
    const { title, amount, category } = req.body;
    let receiptUrl = '';

    if (req.file) {
      receiptUrl = req.file.path; // Cloudinary URL
    }

    const expense = await Expense.create({
      employeeId: req.user._id,
      title,
      amount,
      category,
      receiptUrl,
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee's own expenses
// @route   GET /api/expenses/my
// @access  Private
const getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user._id }).sort('-submittedDate');
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Expenses
// @route   GET /api/expenses
// @access  Private/HR/Admin/Manager
const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({}).populate('employeeId', 'name email').sort('-submittedDate');
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Expense Status (Approve/Reject)
// @route   PUT /api/expenses/:id/status
// @access  Private/Manager/HR/Admin
const updateExpenseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      expense.status = status;
      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404);
      throw new Error('Expense claim not found');
    }
  } catch (error) {
    next(error);
  }
};

export { submitExpense, getMyExpenses, getAllExpenses, updateExpenseStatus };
