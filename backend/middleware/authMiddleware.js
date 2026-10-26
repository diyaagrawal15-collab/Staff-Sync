const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// Protect routes: verify JWT in Bearer header
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login first.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_hrm_system_2026_antigravity');
    const { isConnected } = getDBStatus();

    let user;
    if (isConnected) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.users.find((u) => u._id.toString() === decoded.id.toString());
      if (user) {
        const { password, ...userWithoutPass } = user;
        user = userWithoutPass;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired. Please login again.'
    });
  }
};

// Grant access to specific roles (e.g. 'hr', 'manager')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
