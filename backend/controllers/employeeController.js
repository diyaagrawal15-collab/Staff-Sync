const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const { memoryStore } = require('../config/memoryStore');
const { getDBStatus } = require('../config/db');

// @desc    Get all employees with pagination, search, filter
// @route   GET /api/employees
// @access  Private (HR, Manager)
const getEmployees = async (req, res) => {
  try {
    const { search = '', department = '', role = '', page = 1, limit = 10 } = req.query;
    const { isConnected } = getDBStatus();

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    if (isConnected) {
      const userFilter = {};
      if (search) {
        userFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (department) {
        userFilter.department = department;
      }
      if (role) {
        userFilter.role = role;
      }

      const total = await User.countDocuments(userFilter);
      const users = await User.find(userFilter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Join with Employee data
      const userIds = users.map(u => u._id);
      const employees = await Employee.find({ userId: { $in: userIds } }).populate('managerId', 'name email');

      const employeeMap = {};
      employees.forEach(emp => {
        employeeMap[emp.userId.toString()] = emp;
      });

      const combined = users.map(user => ({
        ...user.toObject(),
        employeeDetails: employeeMap[user._id.toString()] || null
      }));

      return res.status(200).json({
        success: true,
        count: combined.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: combined
      });
    } else {
      let filteredUsers = memoryStore.users.map(u => {
        const { password, ...safeUser } = u;
        const emp = memoryStore.employees.find(e => e.userId.toString() === u._id.toString());
        return {
          ...safeUser,
          employeeDetails: emp || null
        };
      });

      if (search) {
        const s = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.employeeDetails && u.employeeDetails.employeeId.toLowerCase().includes(s))
        );
      }

      if (department) {
        filteredUsers = filteredUsers.filter(u => u.department.toLowerCase() === department.toLowerCase());
      }

      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role.toLowerCase() === role.toLowerCase());
      }

      const total = filteredUsers.length;
      const paginated = filteredUsers.slice(skip, skip + limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        data: paginated
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const employee = await Employee.findOne({ userId: id }).populate('managerId', 'name email');

      return res.status(200).json({
        success: true,
        data: {
          ...user.toObject(),
          employeeDetails: employee
        }
      });
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === id.toString());
      if (!user) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const { password, ...safeUser } = user;
      const employee = memoryStore.employees.find(e => e.userId.toString() === id.toString());

      return res.status(200).json({
        success: true,
        data: {
          ...safeUser,
          employeeDetails: employee || null
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new employee (User + Employee record)
// @route   POST /api/employees
// @access  Private (HR)
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password = 'Password123!',
      role = 'employee',
      department,
      designation,
      salary = 50000,
      managerId = null,
      phone = '',
      skills = []
    } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const { isConnected } = getDBStatus();

    if (isConnected) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        department,
        phone
      });

      const empCount = await Employee.countDocuments();
      const employeeId = `EMP-${String(empCount + 101).padStart(3, '0')}`;

      const employee = await Employee.create({
        userId: user._id,
        employeeId,
        department,
        designation,
        salary,
        managerId: managerId || null,
        skills
      });

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: {
          ...user.toObject(),
          employeeDetails: employee
        }
      });
    } else {
      const exists = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const newUserId = `65b2100000000000000000${String(memoryStore.users.length + 1).padStart(2, '0')}`;
      const newUser = {
        _id: newUserId,
        name,
        email: email.toLowerCase(),
        password: 'Password123!',
        role,
        department,
        phone,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        status: 'active',
        createdAt: new Date()
      };
      memoryStore.users.push(newUser);

      const employeeId = `EMP-${String(memoryStore.employees.length + 101).padStart(3, '0')}`;
      const newEmployee = {
        _id: `65b2200000000000000000${String(memoryStore.employees.length + 1).padStart(2, '0')}`,
        userId: newUserId,
        employeeId,
        department,
        designation,
        dateOfJoining: new Date(),
        managerId: managerId || null,
        salary,
        leaveBalance: { annual: 15, sick: 10, casual: 8 },
        address: {},
        emergencyContact: {},
        skills: Array.isArray(skills) ? skills : [],
        performanceRating: 4.0
      };
      memoryStore.employees.push(newEmployee);

      const { password: _, ...safeUser } = newUser;
      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: {
          ...safeUser,
          employeeDetails: newEmployee
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update employee profile & job details
// @route   PUT /api/employees/:id
// @access  Private (HR)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, designation, role, salary, managerId, status, phone } = req.body;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          ...(name && { name }),
          ...(department && { department }),
          ...(role && { role }),
          ...(status && { status }),
          ...(phone !== undefined && { phone })
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      const updatedEmp = await Employee.findOneAndUpdate(
        { userId: id },
        {
          ...(department && { department }),
          ...(designation && { designation }),
          ...(salary !== undefined && { salary }),
          ...(managerId !== undefined && { managerId: managerId || null })
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: {
          ...updatedUser.toObject(),
          employeeDetails: updatedEmp
        }
      });
    } else {
      const userIdx = memoryStore.users.findIndex(u => u._id.toString() === id.toString());
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      if (name) memoryStore.users[userIdx].name = name;
      if (department) memoryStore.users[userIdx].department = department;
      if (role) memoryStore.users[userIdx].role = role;
      if (status) memoryStore.users[userIdx].status = status;
      if (phone !== undefined) memoryStore.users[userIdx].phone = phone;

      const empIdx = memoryStore.employees.findIndex(e => e.userId.toString() === id.toString());
      if (empIdx !== -1) {
        if (department) memoryStore.employees[empIdx].department = department;
        if (designation) memoryStore.employees[empIdx].designation = designation;
        if (salary !== undefined) memoryStore.employees[empIdx].salary = salary;
        if (managerId !== undefined) memoryStore.employees[empIdx].managerId = managerId || null;
      }

      const { password, ...safeUser } = memoryStore.users[userIdx];
      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: {
          ...safeUser,
          employeeDetails: memoryStore.employees[empIdx] || null
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete or deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (HR)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { isConnected } = getDBStatus();

    if (isConnected) {
      await User.findByIdAndUpdate(id, { status: 'inactive' });
      return res.status(200).json({ success: true, message: 'Employee deactivated successfully' });
    } else {
      const user = memoryStore.users.find(u => u._id.toString() === id.toString());
      if (!user) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      user.status = 'inactive';
      return res.status(200).json({ success: true, message: 'Employee deactivated successfully' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all managers for dropdown selection
// @route   GET /api/employees/managers
// @access  Private
const getManagers = async (req, res) => {
  try {
    const { isConnected } = getDBStatus();
    if (isConnected) {
      const managers = await User.find({ role: { $in: ['manager', 'hr'] }, status: 'active' })
        .select('name email role department avatar')
        .sort({ name: 1 });
      return res.status(200).json({ success: true, data: managers });
    } else {
      const managers = memoryStore.users
        .filter(u => ['manager', 'hr'].includes(u.role) && u.status === 'active')
        .map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, department: u.department, avatar: u.avatar }));
      return res.status(200).json({ success: true, data: managers });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getManagers
};
