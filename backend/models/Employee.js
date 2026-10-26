const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    dateOfJoining: {
      type: Date,
      default: Date.now
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    salary: {
      type: Number,
      default: 50000
    },
    leaveBalance: {
      annual: { type: Number, default: 15 },
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 8 }
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'USA' },
      zipCode: { type: String, default: '' }
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.0
    }
  },
  {
    timestamps: true
  }
);

employeeSchema.index({ department: 1 });
employeeSchema.index({ managerId: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
