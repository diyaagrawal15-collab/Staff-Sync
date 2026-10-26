const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAnnouncements);
router.post('/', protect, authorize('hr', 'manager'), createAnnouncement);
router.put('/:id', protect, authorize('hr', 'manager'), updateAnnouncement);
router.delete('/:id', protect, authorize('hr'), deleteAnnouncement);

module.exports = router;
