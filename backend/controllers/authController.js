const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'supersecretjwtkey_hrm_system_2026_antigravity',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new employee / user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'employee', department = 'General', designation = 'Team Member' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        department
      });

      // Also create linked employee record
      const empCount = await Employee.countDocuments();
      const employeeId = `EMP-${String(empCount + 1).padStart(3, '0')}`;

      await Employee.create({
        userId: user._id,
        employeeId,
        department,
        designation
      });

      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          avatar: user.avatar
        }
      });
    } else {
      // Memory Store Fallback
      const userExists = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUserId = `65b2100000000000000000${String(memoryStore.users.length + 1).padStart(2, '0')}`;

      const newUser = {
        _id: newUserId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        department,
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        status: 'active',
        createdAt: new Date()
      };

      memoryStore.users.push(newUser);

      const employeeId = `EMP-${String(memoryStore.employees.length + 1).padStart(3, '0')}`;
      memoryStore.employees.push({
        _id: `65b2200000000000000000${String(memoryStore.employees.length + 1).padStart(2, '0')}`,
        userId: newUserId,
        employeeId,
        department,
        designation,
        dateOfJoining: new Date(),
        managerId: null,
        salary: 50000,
        leaveBalance: { annual: 15, sick: 10, casual: 8 },
        address: {},
        emergencyContact: {},
        skills: [],
        performanceRating: 4.0
      });

      const token = generateToken(newUser._id, newUser.role);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          avatar: newUser.avatar
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const { isConnected } = getDBStatus();

    let user;
    let isMatch = false;

    if (isConnected) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) {
        isMatch = await user.matchPassword(password);
      }
    } else {
      user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is inactive. Please contact HR.' });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        phone: user.phone || ''
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user & employee profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();
    let employeeData = null;

    if (isConnected) {
      employeeData = await Employee.findOne({ userId: req.user._id }).populate('managerId', 'name email');
    } else {
      const emp = memoryStore.employees.find(e => e.userId.toString() === req.user._id.toString());
      if (emp) {
        employeeData = { ...emp };
        if (emp.managerId) {
          const mgrUser = memoryStore.users.find(u => u._id.toString() === emp.managerId.toString());
          if (mgrUser) employeeData.managerId = { name: mgrUser.name, email: mgrUser.email };
        }
      }
    }

    return res.status(200).json({
      success: true,
      user: req.user,
      employee: employeeData
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, address, emergencyContact, skills } = req.body;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(name && { name }),
          ...(phone !== undefined && { phone }),
          ...(avatar && { avatar })
        },
        { new: true, runValidators: true }
      ).select('-password');

      let updatedEmployee = null;
      if (address || emergencyContact || skills) {
        updatedEmployee = await Employee.findOneAndUpdate(
          { userId: req.user._id },
          {
            ...(address && { address }),
            ...(emergencyContact && { emergencyContact }),
            ...(skills && { skills })
          },
          { new: true }
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
        employee: updatedEmployee
      });
    } else {
      const userIdx = memoryStore.users.findIndex(u => u._id.toString() === req.user._id.toString());
      if (userIdx !== -1) {
        if (name) memoryStore.users[userIdx].name = name;
        if (phone !== undefined) memoryStore.users[userIdx].phone = phone;
        if (avatar) memoryStore.users[userIdx].avatar = avatar;
      }

      const empIdx = memoryStore.employees.findIndex(e => e.userId.toString() === req.user._id.toString());
      if (empIdx !== -1) {
        if (address) memoryStore.employees[empIdx].address = { ...memoryStore.employees[empIdx].address, ...address };
        if (emergencyContact) memoryStore.employees[empIdx].emergencyContact = { ...memoryStore.employees[empIdx].emergencyContact, ...emergencyContact };
        if (skills) memoryStore.employees[empIdx].skills = skills;
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: memoryStore.users[userIdx],
        employee: memoryStore.employees[empIdx]
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const user = await User.findById(req.user._id).select('+password');
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({ success: true, message: 'Password updated successfully!' });
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === req.user._id.toString());
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      return res.status(200).json({ success: true, message: 'Password updated successfully!' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
