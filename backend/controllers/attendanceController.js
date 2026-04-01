import Attendance from '../models/Attendance.js';

// @desc    Clock In
// @route   POST /api/attendance/clockin
// @access  Private
const clockIn = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: { $gte: today },
    });

    if (existingAttendance) {
      res.status(400);
      throw new Error('Already clocked in today');
    }

    const attendance = await Attendance.create({
      employeeId: req.user._id,
      date: new Date(),
      clockIn: new Date(),
      locationCoordinates: req.body.location,
    });

    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Clock Out
// @route   POST /api/attendance/clockout
// @access  Private
const clockOut = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: { $gte: today },
    });

    if (!attendance) {
      res.status(404);
      throw new Error('No clock-in record found for today');
    }

    if (attendance.clockOut) {
      res.status(400);
      throw new Error('Already clocked out today');
    }

    attendance.clockOut = new Date();
    // basic work hours calculation
    const hours = Math.abs(attendance.clockOut - attendance.clockIn) / 36e5;
    attendance.workHours = hours;

    await attendance.save();

    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Attendance History
// @route   GET /api/attendance/history/:id
// @access  Private
const getAttendanceHistory = async (req, res, next) => {
  try {
    // allow user to see own or HR/Manager to see others
    if (req.user._id.toString() !== req.params.id && req.user.role === 'Employee') {
      res.status(403);
      throw new Error('Not authorized to view this record');
    }

    const history = await Attendance.find({ employeeId: req.params.id }).sort('-date');
    res.json(history);
  } catch (error) {
    next(error);
  }
};

export { clockIn, clockOut, getAttendanceHistory };
