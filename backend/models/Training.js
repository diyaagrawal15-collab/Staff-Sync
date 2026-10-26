const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Training description is required']
    },
    category: {
      type: String,
      enum: ['Technical', 'Leadership', 'Compliance', 'Safety', 'Soft Skills', 'Productivity'],
      default: 'Technical'
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required']
    },
    durationHours: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 hour']
    },
    maxCapacity: {
      type: Number,
      default: 30
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    enrolledEmployees: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        enrolledAt: {
          type: Date,
          default: Date.now
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        status: {
          type: String,
          enum: ['enrolled', 'in-progress', 'completed'],
          default: 'enrolled'
        },
        score: {
          type: Number,
          default: null
        }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

trainingSchema.index({ category: 1 });
trainingSchema.index({ status: 1 });

module.exports = mongoose.model('Training', trainingSchema);
