const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/today', protect, getTodayStatus);
router.get('/my', protect, getMyAttendance);
router.get('/team', protect, authorize('manager', 'hr'), getTeamAttendance);
router.get('/all', protect, authorize('hr'), getAllAttendance);

module.exports = router;
