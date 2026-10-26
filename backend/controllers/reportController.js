const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// @desc    Get HR Analytics and Reports
// @route   GET /api/reports/hr
// @access  Private (HR)
const getHRAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const totalEmployees = await User.countDocuments({ status: 'active' });
      const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
      const approvedLeaves = await Leave.countDocuments({ status: 'approved' });

      const attendanceToday = await Attendance.find({ date: today });
      const presentCount = attendanceToday.filter(a => a.status === 'present').length;
      const lateCount = attendanceToday.filter(a => a.status === 'late').length;
      const halfDayCount = attendanceToday.filter(a => a.status === 'half-day').length;

      // Department distribution
      const deptAgg = await User.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]);

      // Leave type distribution
      const leaveTypeAgg = await Leave.aggregate([
        { $group: { _id: '$leaveType', count: { $sum: 1 } } }
      ]);

      // Salary analytics
      const salaryAgg = await Employee.aggregate([
        {
          $group: {
            _id: null,
            totalPayroll: { $sum: '$salary' },
            avgSalary: { $avg: '$salary' },
            minSalary: { $min: '$salary' },
            maxSalary: { $max: '$salary' }
          }
        }
      ]);

      const payrollStats = salaryAgg[0] || { totalPayroll: 0, avgSalary: 0, minSalary: 0, maxSalary: 0 };

      // Training metrics
      const trainings = await Training.find();
      let totalEnrollments = 0;
      let completedTrainings = 0;

      trainings.forEach(t => {
        t.enrolledEmployees.forEach(ee => {
          totalEnrollments++;
          if (ee.status === 'completed') completedTrainings++;
        });
      });

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalEmployees,
            activeToday: presentCount + lateCount + halfDayCount,
            attendanceRate: totalEmployees > 0 ? Math.round(((presentCount + lateCount) / totalEmployees) * 100) : 0,
            pendingLeaves,
            approvedLeaves,
            activeTrainings: trainings.filter(t => t.status === 'active' || t.status === 'upcoming').length
          },
          todayAttendance: {
            present: presentCount,
            late: lateCount,
            halfDay: halfDayCount,
            absent: Math.max(0, totalEmployees - (presentCount + lateCount + halfDayCount))
          },
          departmentDistribution: deptAgg.map(d => ({ department: d._id || 'Unassigned', count: d.count })),
          leaveTypeDistribution: leaveTypeAgg.map(l => ({ type: l._id, count: l.count })),
          payroll: {
            totalPayroll: payrollStats.totalPayroll,
            avgSalary: Math.round(payrollStats.avgSalary),
            minSalary: payrollStats.minSalary,
            maxSalary: payrollStats.maxSalary
          },
          trainingMetrics: {
            totalEnrollments,
            completedTrainings,
            completionRate: totalEnrollments > 0 ? Math.round((completedTrainings / totalEnrollments) * 100) : 0
          }
        }
      });
    } else {
      // Memory Store Analytics
      const activeUsers = memoryStore.users.filter(u => u.status === 'active');
      const totalEmployees = activeUsers.length;
      const pendingLeaves = memoryStore.leaves.filter(l => l.status === 'pending').length;
      const approvedLeaves = memoryStore.leaves.filter(l => l.status === 'approved').length;

      const attendanceToday = memoryStore.attendance.filter(a => a.date === today);
      const presentCount = attendanceToday.filter(a => a.status === 'present').length;
      const lateCount = attendanceToday.filter(a => a.status === 'late').length;
      const halfDayCount = attendanceToday.filter(a => a.status === 'half-day').length;

      // Department distribution
      const deptCounts = {};
      activeUsers.forEach(u => {
        const dept = u.department || 'General';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });

      // Leave type distribution
      const leaveTypeCounts = {};
      memoryStore.leaves.forEach(l => {
        leaveTypeCounts[l.leaveType] = (leaveTypeCounts[l.leaveType] || 0) + 1;
      });

      // Payroll analytics
      let totalSalary = 0;
      let minSalary = Infinity;
      let maxSalary = 0;
      memoryStore.employees.forEach(e => {
        const s = e.salary || 0;
        totalSalary += s;
        if (s < minSalary) minSalary = s;
        if (s > maxSalary) maxSalary = s;
      });
      const avgSalary = memoryStore.employees.length > 0 ? Math.round(totalSalary / memoryStore.employees.length) : 0;

      // Training metrics
      let totalEnrollments = 0;
      let completedTrainings = 0;
      memoryStore.trainings.forEach(t => {
        t.enrolledEmployees.forEach(ee => {
          totalEnrollments++;
          if (ee.status === 'completed') completedTrainings++;
        });
      });

      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalEmployees,
            activeToday: presentCount + lateCount + halfDayCount,
            attendanceRate: totalEmployees > 0 ? Math.round(((presentCount + lateCount) / totalEmployees) * 100) : 0,
            pendingLeaves,
            approvedLeaves,
            activeTrainings: memoryStore.trainings.length
          },
          todayAttendance: {
            present: presentCount,
            late: lateCount,
            halfDay: halfDayCount,
            absent: Math.max(0, totalEmployees - (presentCount + lateCount + halfDayCount))
          },
          departmentDistribution: Object.entries(deptCounts).map(([department, count]) => ({ department, count })),
          leaveTypeDistribution: Object.entries(leaveTypeCounts).map(([type, count]) => ({ type, count })),
          payroll: {
            totalPayroll: totalSalary,
            avgSalary,
            minSalary: minSalary === Infinity ? 0 : minSalary,
            maxSalary
          },
          trainingMetrics: {
            totalEnrollments,
            completedTrainings,
            completionRate: totalEnrollments > 0 ? Math.round((completedTrainings / totalEnrollments) * 100) : 0
          }
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get Manager Team Analytics
// @route   GET /api/reports/manager
// @access  Private (Manager, HR)
const getManagerAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const teamEmps = await Employee.find({ managerId: req.user._id });
      const teamUserIds = teamEmps.map(e => e.userId);

      const teamSize = teamUserIds.length;
      const todayAttendance = await Attendance.find({ userId: { $in: teamUserIds }, date: today });
      const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;

      const pendingLeaves = await Leave.countDocuments({ userId: { $in: teamUserIds }, status: 'pending' });

      return res.status(200).json({
        success: true,
        data: {
          teamSize,
          teamPresentToday: presentCount,
          attendanceRate: teamSize > 0 ? Math.round((presentCount / teamSize) * 100) : 0,
          pendingLeaves
        }
      });
    } else {
      const teamEmps = memoryStore.employees.filter(
        e => e.managerId && e.managerId.toString() === req.user._id.toString()
      );
      const teamUserIds = teamEmps.map(e => e.userId.toString());

      const teamSize = teamUserIds.length;
      const todayAttendance = memoryStore.attendance.filter(
        a => teamUserIds.includes(a.userId.toString()) && a.date === today
      );
      const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;

      const pendingLeaves = memoryStore.leaves.filter(
        l => teamUserIds.includes(l.userId.toString()) && l.status === 'pending'
      ).length;

      return res.status(200).json({
        success: true,
        data: {
          teamSize,
          teamPresentToday: presentCount,
          attendanceRate: teamSize > 0 ? Math.round((presentCount / teamSize) * 100) : 0,
          pendingLeaves
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getHRAnalytics,
  getManagerAnalytics
};
