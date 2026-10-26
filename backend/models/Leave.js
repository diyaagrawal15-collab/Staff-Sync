const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid'],
      required: [true, 'Please select a leave type']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Leave must be for at least 1 day']
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the leave'],
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewComment: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

leaveSchema.index({ userId: 1, status: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
