import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../store/slices/authSlice';
import { Briefcase, Lock, Mail, User, Building, AlertCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer'
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    dispatch(registerUser(submitData));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '1rem'
            }}
          >
            <Briefcase size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Create Your HRM Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Join your organization's workforce management platform
          </p>
        </div>

        {(error || validationError) && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} /> {validationError || error}
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. Johnathan Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR Director</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Title / Designation</label>
              <input
                type="text"
                name="designation"
                className="form-control"
                placeholder="e.g. Frontend Engineer"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Min 6 chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Confirm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
