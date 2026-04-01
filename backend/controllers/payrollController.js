import Payroll from '../models/Payroll.js';
import User from '../models/User.js';

// @desc    Generate Payroll for an employee
// @route   POST /api/payroll
// @access  Private/HR/Admin
const generatePayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year, baseSalary, allowances, deductions } = req.body;

    const user = await User.findById(employeeId);
    if (!user) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // Basic tax calculation logic (e.g. 10% tax on baseSalary if above certain limit)
    // Simplified: flat 10%
    const tax = baseSalary * 0.10;
    const netSalary = (baseSalary + (allowances || 0)) - ((deductions || 0) + tax);

    const payrollExists = await Payroll.findOne({ employeeId, month, year });

    if (payrollExists) {
      res.status(400);
      throw new Error(`Payroll for ${month} ${year} already generated for this employee.`);
    }

    const payroll = await Payroll.create({
      employeeId,
      month,
      year,
      baseSalary,
      allowances,
      deductions,
      tax,
      netSalary,
    });

    res.status(201).json(payroll);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee's own payroll
// @route   GET /api/payroll/my
// @access  Private
const getMyPayroll = async (req, res, next) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.user._id }).sort('-year -month');
    res.json(payrolls);
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Payrolls
// @route   GET /api/payroll
// @access  Private/HR/Admin
const getAllPayrolls = async (req, res, next) => {
  try {
    const payrolls = await Payroll.find({}).populate('employeeId', 'name email').sort('-createdAt');
    res.json(payrolls);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Payroll Status (e.g. Pending -> Paid)
// @route   PUT /api/payroll/:id/status
// @access  Private/HR/Admin
const updatePayrollStatus = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (payroll) {
      payroll.status = req.body.status || payroll.status;
      const updatedPayroll = await payroll.save();
      res.json(updatedPayroll);
    } else {
      res.status(404);
      throw new Error('Payroll not found');
    }
  } catch (error) {
    next(error);
  }
};

export { generatePayroll, getMyPayroll, getAllPayrolls, updatePayrollStatus };
