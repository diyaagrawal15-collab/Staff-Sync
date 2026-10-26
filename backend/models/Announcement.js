const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    targetAudience: {
      type: String,
      enum: ['all', 'engineering', 'sales', 'hr', 'management', 'marketing'],
      default: 'all'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
