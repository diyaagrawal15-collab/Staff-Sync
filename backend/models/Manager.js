const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    projectAssignments: [
      {
        projectName: { type: String, required: true },
        description: { type: String, default: '' },
        status: {
          type: String,
          enum: ['planned', 'in-progress', 'completed'],
          default: 'in-progress'
        },
        deadline: { type: Date }
      }
    ]
  },
  {
    timestamps: true
  }
);

managerSchema.index({ department: 1 });

module.exports = mongoose.model('Manager', managerSchema);
