const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();
    const userRole = req.user.role;
    const userDept = req.user.department ? req.user.department.toLowerCase() : '';

    if (isConnected) {
      const announcements = await Announcement.find({
        $or: [
          { targetAudience: 'all' },
          { targetAudience: userDept },
          { targetAudience: userRole }
        ]
      })
        .populate('createdBy', 'name email avatar role')
        .sort({ isPinned: -1, createdAt: -1 });

      return res.status(200).json({ success: true, count: announcements.length, data: announcements });
    } else {
      const announcements = memoryStore.announcements
        .filter(a => a.targetAudience === 'all' || a.targetAudience === userDept || a.targetAudience === userRole)
        .map(a => {
          const creator = memoryStore.users.find(u => u._id.toString() === a.createdBy.toString());
          return {
            ...a,
            createdBy: creator ? { _id: creator._id, name: creator.name, email: creator.email, avatar: creator.avatar, role: creator.role } : a.createdBy
          };
        })
        .sort((a, b) => {
          if (b.isPinned !== a.isPinned) return b.isPinned ? 1 : -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

      return res.status(200).json({ success: true, count: announcements.length, data: announcements });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (HR, Manager)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority = 'medium', targetAudience = 'all', isPinned = false } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const announcement = await Announcement.create({
        title,
        content,
        priority,
        targetAudience,
        isPinned,
        createdBy: req.user._id
      });

      return res.status(201).json({
        success: true,
        message: 'Announcement published successfully',
        data: announcement
      });
    } else {
      const announcement = {
        _id: `65b2600000000000000000${String(memoryStore.announcements.length + 1).padStart(2, '0')}`,
        title,
        content,
        priority,
        targetAudience,
        isPinned,
        createdBy: req.user._id.toString(),
        createdAt: new Date()
      };

      memoryStore.announcements.unshift(announcement);

      return res.status(201).json({
        success: true,
        message: 'Announcement published successfully',
        data: announcement
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (HR, Manager)
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, priority, targetAudience, isPinned } = req.body;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const updated = await Announcement.findByIdAndUpdate(
        id,
        {
          ...(title && { title }),
          ...(content && { content }),
          ...(priority && { priority }),
          ...(targetAudience && { targetAudience }),
          ...(isPinned !== undefined && { isPinned })
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }

      return res.status(200).json({ success: true, data: updated });
    } else {
      const idx = memoryStore.announcements.findIndex(a => a._id.toString() === id.toString());
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }

      if (title) memoryStore.announcements[idx].title = title;
      if (content) memoryStore.announcements[idx].content = content;
      if (priority) memoryStore.announcements[idx].priority = priority;
      if (targetAudience) memoryStore.announcements[idx].targetAudience = targetAudience;
      if (isPinned !== undefined) memoryStore.announcements[idx].isPinned = isPinned;

      return res.status(200).json({ success: true, data: memoryStore.announcements[idx] });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR, Manager)
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      await Announcement.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } else {
      memoryStore.announcements = memoryStore.announcements.filter(a => a._id.toString() !== id.toString());
      return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
