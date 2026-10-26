const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getManagers
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/managers', protect, getManagers);
router.get('/', protect, authorize('hr', 'manager'), getEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, authorize('hr'), createEmployee);
router.put('/:id', protect, authorize('hr'), updateEmployee);
router.delete('/:id', protect, authorize('hr'), deleteEmployee);

module.exports = router;
