import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  fetchManagers,
  createEmployee,
  updateEmployee,
  clearEmployeeMessage
} from '../store/slices/employeeSlice';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Eye,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: employees, managers, loading, successMessage, error } = useSelector((state) => state.employees);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    salary: 60000,
    managerId: '',
    phone: '',
    skills: ''
  });

  const isHR = user?.role === 'hr';

  useEffect(() => {
    dispatch(fetchEmployees({ search: searchTerm, department: selectedDept, role: selectedRole }));
    dispatch(fetchManagers());
  }, [dispatch, searchTerm, selectedDept, selectedRole]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearEmployeeMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: 'Engineering',
      designation: '',
      salary: 60000,
      managerId: managers[0]?._id || '',
      phone: '',
      skills: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name,
      department: emp.department,
      designation: emp.employeeDetails?.designation || '',
      role: emp.role,
      salary: emp.employeeDetails?.salary || 50000,
      managerId: emp.employeeDetails?.managerId?._id || emp.employeeDetails?.managerId || '',
      phone: emp.phone || '',
      status: emp.status
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setIsViewModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const skillsArray = formData.skills
      ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    await dispatch(
      createEmployee({
        ...formData,
        skills: skillsArray
      })
    );
    setIsAddModalOpen(false);
    dispatch(fetchEmployees());
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await dispatch(
      updateEmployee({
        id: selectedEmployee._id,
        data: formData
      })
    );
    setIsEditModalOpen(false);
    dispatch(fetchEmployees());
  };

  return (
    <div className="page-body">
      {/* Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {isHR ? 'Workforce Directory' : 'Team Directory'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage employee records, job designations, reporting lines, and departments
          </p>
        </div>

        {isHR && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <UserPlus size={18} /> Onboard New Employee
          </button>
        )}
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by employee name or email..."
              className="form-control"
              style={{ paddingLeft: '38px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select
              className="form-control"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR Director</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading employee database...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                          alt={emp.name}
                          className="avatar"
                          style={{ width: '36px', height: '36px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {emp.employeeDetails?.employeeId || 'EMP-SYS'}
                      </span>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.employeeDetails?.designation || 'Specialist'}</td>
                    <td>
                      <span
                        className={`badge ${
                          emp.role === 'hr'
                            ? 'badge-danger'
                            : emp.role === 'manager'
                            ? 'badge-primary'
                            : 'badge-secondary'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenView(emp)}
                          className="btn btn-outline btn-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {isHR && (
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Record"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Employee">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">System Role</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Director</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Job Title / Designation</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Annual Salary ($)</label>
              <input
                type="number"
                className="form-control"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Manager</label>
            <select
              className="form-control"
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
            >
              <option value="">None / Executive</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.department} - {m.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. React, Node.js, TypeScript, Docker"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Employee Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Employee Record">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Annual Salary ($)</label>
              <input
                type="number"
                className="form-control"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Record
            </button>
          </div>
        </form>
      </Modal>

      {/* View Employee Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Employee Profile Details">
        {selectedEmployee && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="avatar"
                style={{ width: '60px', height: '60px' }}
              />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{selectedEmployee.name}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedEmployee.email}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span className="badge badge-primary">{selectedEmployee.department}</span>
                  <span className="badge badge-secondary">{selectedEmployee.employeeDetails?.employeeId}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.25rem 0' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Designation</span>
                <span style={{ fontWeight: 600 }}>{selectedEmployee.employeeDetails?.designation || 'Team Member'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone</span>
                <span style={{ fontWeight: 600 }}>{selectedEmployee.phone || 'Not provided'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Annual Compensation</span>
                <span style={{ fontWeight: 600 }}>${(selectedEmployee.employeeDetails?.salary || 0).toLocaleString()}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Performance Rating</span>
                <span style={{ fontWeight: 600 }}>⭐ {selectedEmployee.employeeDetails?.performanceRating || 4.5} / 5</span>
              </div>
            </div>

            {selectedEmployee.employeeDetails?.skills?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  Verified Skills
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {selectedEmployee.employeeDetails.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setIsViewModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeesPage;
