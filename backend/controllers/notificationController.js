const Notification = require('../models/Notification');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);

      const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

      return res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
    } else {
      const notifications = memoryStore.notifications
        .filter(n => n.recipient.toString() === req.user._id.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const unreadCount = notifications.filter(n => !n.isRead).length;

      return res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } else {
      const n = memoryStore.notifications.find(item => item._id.toString() === id.toString());
      if (n) n.isRead = true;
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();

    if (isConnected) {
      await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } else {
      memoryStore.notifications.forEach(n => {
        if (n.recipient.toString() === req.user._id.toString()) {
          n.isRead = true;
        }
      });
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
