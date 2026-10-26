const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// @desc    Clock in for today
// @route   POST /api/attendance/clock-in
// @access  Private (Employee, Manager, HR)
const clockIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { isConnected } = getDBStatus();
    const notes = req.body.notes || 'Normal clock-in';

    if (isConnected) {
      let existing = await Attendance.findOne({ userId: req.user._id, date: today });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already clocked in today!' });
      }

      // Check if late (e.g., after 9:30 AM local)
      const currentHour = new Date().getHours();
      const currentMin = new Date().getMinutes();
      const isLate = currentHour > 9 || (currentHour === 9 && currentMin > 30);

      const record = await Attendance.create({
        userId: req.user._id,
        date: today,
        clockIn: new Date(),
        status: isLate ? 'late' : 'present',
        notes
      });

      return res.status(201).json({
        success: true,
        message: 'Clocked in successfully',
        data: record
      });
    } else {
      const existing = memoryStore.attendance.find(
        a => a.userId.toString() === req.user._id.toString() && a.date === today
      );
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already clocked in today!' });
      }

      const currentHour = new Date().getHours();
      const currentMin = new Date().getMinutes();
      const isLate = currentHour > 9 || (currentHour === 9 && currentMin > 30);

      const record = {
        _id: `65b2400000000000000000${String(memoryStore.attendance.length + 1).padStart(2, '0')}`,
        userId: req.user._id.toString(),
        date: today,
        clockIn: new Date(),
        clockOut: null,
        totalHours: 0,
        status: isLate ? 'late' : 'present',
        notes
      };

      memoryStore.attendance.push(record);

      return res.status(201).json({
        success: true,
        message: 'Clocked in successfully',
        data: record
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Clock out for today
// @route   POST /api/attendance/clock-out
// @access  Private (Employee, Manager, HR)
const clockOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const record = await Attendance.findOne({ userId: req.user._id, date: today });
      if (!record) {
        return res.status(400).json({ success: false, message: 'You have not clocked in today yet!' });
      }

      if (record.clockOut) {
        return res.status(400).json({ success: false, message: 'You have already clocked out today!' });
      }

      const clockOutTime = new Date();
      const diffMs = clockOutTime.getTime() - new Date(record.clockIn).getTime();
      const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

      record.clockOut = clockOutTime;
      record.totalHours = totalHours;

      if (totalHours < 4 && record.status !== 'late') {
        record.status = 'half-day';
      }

      await record.save();

      return res.status(200).json({
        success: true,
        message: 'Clocked out successfully',
        data: record
      });
    } else {
      const record = memoryStore.attendance.find(
        a => a.userId.toString() === req.user._id.toString() && a.date === today
      );

      if (!record) {
        return res.status(400).json({ success: false, message: 'You have not clocked in today yet!' });
      }

      if (record.clockOut) {
        return res.status(400).json({ success: false, message: 'You have already clocked out today!' });
      }

      const clockOutTime = new Date();
      const diffMs = clockOutTime.getTime() - new Date(record.clockIn).getTime();
      const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

      record.clockOut = clockOutTime;
      record.totalHours = totalHours;
      if (totalHours < 4 && record.status !== 'late') {
        record.status = 'half-day';
      }

      return res.status(200).json({
        success: true,
        message: 'Clocked out successfully',
        data: record
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current user's today status
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const record = await Attendance.findOne({ userId: req.user._id, date: today });
      return res.status(200).json({ success: true, data: record });
    } else {
      const record = memoryStore.attendance.find(
        a => a.userId.toString() === req.user._id.toString() && a.date === today
      );
      return res.status(200).json({ success: true, data: record || null });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get logged in user's attendance history
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const logs = await Attendance.find({ userId: req.user._id }).sort({ date: -1 }).limit(31);
      return res.status(200).json({ success: true, data: logs });
    } else {
      const logs = memoryStore.attendance
        .filter(a => a.userId.toString() === req.user._id.toString())
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return res.status(200).json({ success: true, data: logs });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get team attendance for manager
// @route   GET /api/attendance/team
// @access  Private (Manager, HR)
const getTeamAttendance = async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      // Find employees reporting to this manager
      const employees = await Employee.find({ managerId: req.user._id });
      const userIds = employees.map(e => e.userId);

      const logs = await Attendance.find({ userId: { $in: userIds }, date })
        .populate('userId', 'name email department avatar');

      return res.status(200).json({ success: true, data: logs });
    } else {
      // Memory Store
      const myTeamEmps = memoryStore.employees.filter(
        e => e.managerId && e.managerId.toString() === req.user._id.toString()
      );
      const teamUserIds = myTeamEmps.map(e => e.userId.toString());

      const logs = memoryStore.attendance
        .filter(a => teamUserIds.includes(a.userId.toString()) && a.date === date)
        .map(a => {
          const u = memoryStore.users.find(usr => usr._id.toString() === a.userId.toString());
          return {
            ...a,
            userId: u ? { _id: u._id, name: u.name, email: u.email, department: u.department, avatar: u.avatar } : a.userId
          };
        });

      return res.status(200).json({ success: true, data: logs });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all attendance records (HR / Admin)
// @route   GET /api/attendance/all
// @access  Private (HR)
const getAllAttendance = async (req, res) => {
  try {
    const { date, status, department } = req.query;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const query = {};
      if (date) query.date = date;
      if (status) query.status = status;

      const records = await Attendance.find(query)
        .populate('userId', 'name email department avatar')
        .sort({ date: -1, clockIn: -1 });

      const filtered = department
        ? records.filter(r => r.userId && r.userId.department === department)
        : records;

      return res.status(200).json({ success: true, data: filtered });
    } else {
      let records = memoryStore.attendance.map(a => {
        const u = memoryStore.users.find(usr => usr._id.toString() === a.userId.toString());
        return {
          ...a,
          userId: u ? { _id: u._id, name: u.name, email: u.email, department: u.department, avatar: u.avatar } : a.userId
        };
      });

      if (date) records = records.filter(r => r.date === date);
      if (status) records = records.filter(r => r.status === status);
      if (department) records = records.filter(r => r.userId && r.userId.department === department);

      records.sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.status(200).json({ success: true, data: records });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance
};
