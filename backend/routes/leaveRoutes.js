const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  reviewLeave
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/team', protect, authorize('manager', 'hr'), getTeamLeaves);
router.get('/all', protect, authorize('hr'), getAllLeaves);
router.put('/:id/review', protect, authorize('manager', 'hr'), reviewLeave);

module.exports = router;
