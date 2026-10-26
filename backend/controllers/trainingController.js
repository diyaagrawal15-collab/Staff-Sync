const Training = require('../models/Training');
const Notification = require('../models/Notification');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// @desc    Get training programs
// @route   GET /api/trainings
// @access  Private
const getTrainings = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { instructor: { $regex: search, $options: 'i' } }
        ];
      }

      const trainings = await Training.find(query)
        .populate('createdBy', 'name email')
        .sort({ startDate: 1 });

      return res.status(200).json({ success: true, count: trainings.length, data: trainings });
    } else {
      let trainings = memoryStore.trainings;

      if (category) trainings = trainings.filter(t => t.category.toLowerCase() === category.toLowerCase());
      if (status) trainings = trainings.filter(t => t.status.toLowerCase() === status.toLowerCase());
      if (search) {
        const s = search.toLowerCase();
        trainings = trainings.filter(t =>
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          t.instructor.toLowerCase().includes(s)
        );
      }

      return res.status(200).json({ success: true, count: trainings.length, data: trainings });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single training program
// @route   GET /api/trainings/:id
// @access  Private
const getTrainingById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const training = await Training.findById(id).populate('enrolledEmployees.userId', 'name email avatar department');
      if (!training) {
        return res.status(404).json({ success: false, message: 'Training not found' });
      }
      return res.status(200).json({ success: true, data: training });
    } else {
      const training = memoryStore.trainings.find(t => t._id.toString() === id.toString());
      if (!training) {
        return res.status(404).json({ success: false, message: 'Training not found' });
      }

      const enrichedEnrolled = training.enrolledEmployees.map(ee => {
        const u = memoryStore.users.find(usr => usr._id.toString() === ee.userId.toString());
        return {
          ...ee,
          userId: u ? { _id: u._id, name: u.name, email: u.email, avatar: u.avatar, department: u.department } : ee.userId
        };
      });

      return res.status(200).json({ success: true, data: { ...training, enrolledEmployees: enrichedEnrolled } });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new training
// @route   POST /api/trainings
// @access  Private (HR, Manager)
const createTraining = async (req, res) => {
  try {
    const { title, description, category, instructor, durationHours, maxCapacity, startDate, endDate } = req.body;

    if (!title || !description || !instructor || !durationHours || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const training = await Training.create({
        title,
        description,
        category: category || 'Technical',
        instructor,
        durationHours: Number(durationHours),
        maxCapacity: Number(maxCapacity) || 30,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdBy: req.user._id,
        enrolledEmployees: []
      });

      return res.status(201).json({ success: true, message: 'Training program created', data: training });
    } else {
      const training = {
        _id: `65b2700000000000000000${String(memoryStore.trainings.length + 1).padStart(2, '0')}`,
        title,
        description,
        category: category || 'Technical',
        instructor,
        durationHours: Number(durationHours),
        maxCapacity: Number(maxCapacity) || 30,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'upcoming',
        enrolledEmployees: [],
        createdBy: req.user._id.toString(),
        createdAt: new Date()
      };

      memoryStore.trainings.push(training);

      return res.status(201).json({ success: true, message: 'Training program created', data: training });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Enroll logged in user in training
// @route   POST /api/trainings/:id/enroll
// @access  Private
const enrollTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const training = await Training.findById(id);
      if (!training) {
        return res.status(404).json({ success: false, message: 'Training not found' });
      }

      const alreadyEnrolled = training.enrolledEmployees.some(
        ee => ee.userId.toString() === req.user._id.toString()
      );

      if (alreadyEnrolled) {
        return res.status(400).json({ success: false, message: 'You are already enrolled in this training' });
      }

      if (training.enrolledEmployees.length >= training.maxCapacity) {
        return res.status(400).json({ success: false, message: 'This training program has reached max capacity' });
      }

      training.enrolledEmployees.push({
        userId: req.user._id,
        enrolledAt: new Date(),
        progress: 0,
        status: 'enrolled'
      });

      await training.save();

      return res.status(200).json({
        success: true,
        message: 'Successfully enrolled in training program!',
        data: training
      });
    } else {
      const training = memoryStore.trainings.find(t => t._id.toString() === id.toString());
      if (!training) {
        return res.status(404).json({ success: false, message: 'Training not found' });
      }

      const alreadyEnrolled = training.enrolledEmployees.some(
        ee => ee.userId.toString() === req.user._id.toString()
      );

      if (alreadyEnrolled) {
        return res.status(400).json({ success: false, message: 'You are already enrolled in this training' });
      }

      if (training.enrolledEmployees.length >= training.maxCapacity) {
        return res.status(400).json({ success: false, message: 'This training program has reached max capacity' });
      }

      training.enrolledEmployees.push({
        userId: req.user._id.toString(),
        enrolledAt: new Date(),
        progress: 0,
        status: 'enrolled'
      });

      return res.status(200).json({
        success: true,
        message: 'Successfully enrolled in training program!',
        data: training
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update employee's training progress
// @route   PUT /api/trainings/:id/progress
// @access  Private
const updateTrainingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, score, userId = req.user._id } = req.body;
    const { isConnected } = getDBStatus();

    const progNum = Math.min(100, Math.max(0, Number(progress) || 0));
    const status = progNum === 100 ? 'completed' : progNum > 0 ? 'in-progress' : 'enrolled';

    if (isConnected) {
      const training = await Training.findById(id);
      if (!training) {
        return res.status(404).json({ success: false, message: 'Training not found' });
      }

      const enrolled = training.enrolledEmployees.find(ee => ee.userId.toString() === userId.toString());
      if (!enrolled) {
        return res.status(404).json({ success: false, message: 'User is not enrolled in this training' });
      }

      enrolled.progress = progNum;
      enrolled.status = status;
      if (score !== undefined) enrolled.score = Number(score);

      await training.save();

      return res.status(200).json({ success: true, message: 'Training progress updated', data: training });
    } else {
      const training = memoryStore.trainings.find(t => t._id.toString() === id.toString());
      if (!training) {
        return res.status(404).json({ success: false, message: 'Training not found' });
      }

      const enrolled = training.enrolledEmployees.find(ee => ee.userId.toString() === userId.toString());
      if (!enrolled) {
        return res.status(404).json({ success: false, message: 'User is not enrolled in this training' });
      }

      enrolled.progress = progNum;
      enrolled.status = status;
      if (score !== undefined) enrolled.score = Number(score);

      return res.status(200).json({ success: true, message: 'Training progress updated', data: training });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTrainings,
  getTrainingById,
  createTraining,
  enrollTraining,
  updateTrainingProgress
};
