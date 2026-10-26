const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for fast querying and indexing
      required: true
    },
    clockIn: {
      type: Date,
      default: Date.now
    },
    clockOut: {
      type: Date,
      default: null
    },
    totalHours: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      default: 'present'
    },
    notes: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure 1 attendance record per employee per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
