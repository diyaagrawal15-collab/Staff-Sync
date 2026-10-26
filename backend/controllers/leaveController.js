const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// Helper to compute calendar days difference
const computeDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
};

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private (Employee, Manager, HR)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all leave details' });
    }

    const totalDays = computeDays(startDate, endDate);
    if (totalDays <= 0) {
      return res.status(400).json({ success: false, message: 'End date must be after or on start date' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const emp = await Employee.findOne({ userId: req.user._id });
      if (emp && emp.leaveBalance && emp.leaveBalance[leaveType] !== undefined) {
        if (emp.leaveBalance[leaveType] < totalDays) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${leaveType} leave balance. Available: ${emp.leaveBalance[leaveType]} days, Requested: ${totalDays} days.`
          });
        }
      }

      const leave = await Leave.create({
        userId: req.user._id,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
        status: 'pending'
      });

      // Send notification to manager if assigned
      if (emp && emp.managerId) {
        await Notification.create({
          recipient: emp.managerId,
          title: 'New Leave Request',
          message: `${req.user.name} requested ${totalDays} days of ${leaveType} leave.`,
          type: 'leave',
          link: '/leaves'
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        data: leave
      });
    } else {
      const emp = memoryStore.employees.find(e => e.userId.toString() === req.user._id.toString());
      if (emp && emp.leaveBalance && emp.leaveBalance[leaveType] !== undefined) {
        if (emp.leaveBalance[leaveType] < totalDays) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${leaveType} leave balance. Available: ${emp.leaveBalance[leaveType]} days, Requested: ${totalDays} days.`
          });
        }
      }

      const leave = {
        _id: `65b2500000000000000000${String(memoryStore.leaves.length + 1).padStart(2, '0')}`,
        userId: req.user._id.toString(),
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        reason,
        status: 'pending',
        reviewedBy: null,
        reviewComment: '',
        reviewedAt: null,
        createdAt: new Date()
      };

      memoryStore.leaves.push(leave);

      // Notification to manager
      if (emp && emp.managerId) {
        memoryStore.notifications.push({
          _id: `65b2800000000000000000${String(memoryStore.notifications.length + 1).padStart(2, '0')}`,
          recipient: emp.managerId.toString(),
          title: 'New Leave Request',
          message: `${req.user.name} requested ${totalDays} days of ${leaveType} leave.`,
          type: 'leave',
          link: '/leaves',
          isRead: false,
          createdAt: new Date()
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        data: leave
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get logged in user's leave requests and balance
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const leaves = await Leave.find({ userId: req.user._id })
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      const emp = await Employee.findOne({ userId: req.user._id });
      const balance = emp ? emp.leaveBalance : { annual: 15, sick: 10, casual: 8 };

      return res.status(200).json({
        success: true,
        data: leaves,
        balance
      });
    } else {
      const leaves = memoryStore.leaves
        .filter(l => l.userId.toString() === req.user._id.toString())
        .map(l => {
          let reviewer = null;
          if (l.reviewedBy) {
            const u = memoryStore.users.find(usr => usr._id.toString() === l.reviewedBy.toString());
            if (u) reviewer = { name: u.name, email: u.email };
          }
          return { ...l, reviewedBy: reviewer };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const emp = memoryStore.employees.find(e => e.userId.toString() === req.user._id.toString());
      const balance = emp ? emp.leaveBalance : { annual: 15, sick: 10, casual: 8 };

      return res.status(200).json({
        success: true,
        data: leaves,
        balance
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get team leaves for manager
// @route   GET /api/leaves/team
// @access  Private (Manager, HR)
const getTeamLeaves = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const teamEmps = await Employee.find({ managerId: req.user._id });
      const teamUserIds = teamEmps.map(e => e.userId);

      const leaves = await Leave.find({ userId: { $in: teamUserIds } })
        .populate('userId', 'name email department avatar')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: leaves });
    } else {
      const teamEmps = memoryStore.employees.filter(
        e => e.managerId && e.managerId.toString() === req.user._id.toString()
      );
      const teamUserIds = teamEmps.map(e => e.userId.toString());

      const leaves = memoryStore.leaves
        .filter(l => teamUserIds.includes(l.userId.toString()))
        .map(l => {
          const user = memoryStore.users.find(u => u._id.toString() === l.userId.toString());
          const reviewer = l.reviewedBy ? memoryStore.users.find(u => u._id.toString() === l.reviewedBy.toString()) : null;
          return {
            ...l,
            userId: user ? { _id: user._id, name: user.name, email: user.email, department: user.department, avatar: user.avatar } : l.userId,
            reviewedBy: reviewer ? { name: reviewer.name, email: reviewer.email } : null
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({ success: true, data: leaves });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all organization leaves (HR)
// @route   GET /api/leaves/all
// @access  Private (HR)
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const query = {};
      if (status) query.status = status;
      if (leaveType) query.leaveType = leaveType;

      const leaves = await Leave.find(query)
        .populate('userId', 'name email department avatar')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, data: leaves });
    } else {
      let leaves = memoryStore.leaves.map(l => {
        const user = memoryStore.users.find(u => u._id.toString() === l.userId.toString());
        const reviewer = l.reviewedBy ? memoryStore.users.find(u => u._id.toString() === l.reviewedBy.toString()) : null;
        return {
          ...l,
          userId: user ? { _id: user._id, name: user.name, email: user.email, department: user.department, avatar: user.avatar } : l.userId,
          reviewedBy: reviewer ? { name: reviewer.name, email: reviewer.email } : null
        };
      });

      if (status) leaves = leaves.filter(l => l.status === status);
      if (leaveType) leaves = leaves.filter(l => l.leaveType === leaveType);

      leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json({ success: true, data: leaves });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id/review
// @access  Private (Manager, HR)
const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const leave = await Leave.findById(id);
      if (!leave) {
        return res.status(404).json({ success: false, message: 'Leave request not found' });
      }

      leave.status = status;
      leave.reviewedBy = req.user._id;
      leave.reviewComment = reviewComment;
      leave.reviewedAt = new Date();
      await leave.save();

      // Deduct balance if approved
      if (status === 'approved' && ['annual', 'sick', 'casual'].includes(leave.leaveType)) {
        const emp = await Employee.findOne({ userId: leave.userId });
        if (emp && emp.leaveBalance[leave.leaveType] !== undefined) {
          emp.leaveBalance[leave.leaveType] = Math.max(0, emp.leaveBalance[leave.leaveType] - leave.totalDays);
          await emp.save();
        }
      }

      // Notify the applicant
      await Notification.create({
        recipient: leave.userId,
        title: `Leave ${status.toUpperCase()}`,
        message: `Your ${leave.leaveType} leave request for ${leave.totalDays} day(s) was ${status}. Comment: ${reviewComment || 'None'}`,
        type: 'leave',
        link: '/leaves'
      });

      return res.status(200).json({
        success: true,
        message: `Leave request has been ${status}`,
        data: leave
      });
    } else {
      const leave = memoryStore.leaves.find(l => l._id.toString() === id.toString());
      if (!leave) {
        return res.status(404).json({ success: false, message: 'Leave request not found' });
      }

      leave.status = status;
      leave.reviewedBy = req.user._id.toString();
      leave.reviewComment = reviewComment;
      leave.reviewedAt = new Date();

      if (status === 'approved' && ['annual', 'sick', 'casual'].includes(leave.leaveType)) {
        const emp = memoryStore.employees.find(e => e.userId.toString() === leave.userId.toString());
        if (emp && emp.leaveBalance && emp.leaveBalance[leave.leaveType] !== undefined) {
          emp.leaveBalance[leave.leaveType] = Math.max(0, emp.leaveBalance[leave.leaveType] - leave.totalDays);
        }
      }

      // Notify applicant
      memoryStore.notifications.push({
        _id: `65b2800000000000000000${String(memoryStore.notifications.length + 1).padStart(2, '0')}`,
        recipient: leave.userId.toString(),
        title: `Leave ${status.toUpperCase()}`,
        message: `Your ${leave.leaveType} leave request for ${leave.totalDays} day(s) was ${status}. Comment: ${reviewComment || 'None'}`,
        type: 'leave',
        link: '/leaves',
        isRead: false,
        createdAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: `Leave request has been ${status}`,
        data: leave
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeave
};
