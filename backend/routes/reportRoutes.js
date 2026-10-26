const express = require('express');
const router = express.Router();
const { getHRAnalytics, getManagerAnalytics } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/hr', protect, authorize('hr'), getHRAnalytics);
router.get('/manager', protect, authorize('manager', 'hr'), getManagerAnalytics);

module.exports = router;
