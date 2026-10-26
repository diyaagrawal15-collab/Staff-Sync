const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');
const {
  defaultUsers,
  defaultEmployees,
  defaultManagers,
  defaultAttendance,
  defaultLeaves,
  defaultAnnouncements,
  defaultTrainings,
  defaultNotifications
} = require('./memoryStore');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('🌱 Database already populated with records.');
      return;
    }

    console.log('🌱 Seeding database with initial HRM data...');
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Manager.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Announcement.deleteMany({});
    await Training.deleteMany({});
    await Notification.deleteMany({});

    // Use insertMany to bypass individual hook rehashing
    await User.insertMany(defaultUsers);
    await Employee.insertMany(defaultEmployees);
    await Manager.insertMany(defaultManagers);
    await Attendance.insertMany(defaultAttendance);
    await Leave.insertMany(defaultLeaves);
    await Announcement.insertMany(defaultAnnouncements);
    await Training.insertMany(defaultTrainings);
    await Notification.insertMany(defaultNotifications);

    console.log('✅ Seed completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

module.exports = seedDatabase;
