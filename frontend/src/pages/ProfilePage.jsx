import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe, updateProfile } from '../store/slices/authSlice';
import api from '../services/api';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Shield,
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, employee, successMessage } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', country: '', zipCode: '' });
  const [emergencyContact, setEmergencyContact] = useState({ name: '', relation: '', phone: '' });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
    if (employee) {
      setSkills(Array.isArray(employee.skills) ? employee.skills.join(', ') : '');
      if (employee.address) setAddress(employee.address);
      if (employee.emergencyContact) setEmergencyContact(employee.emergencyContact);
    }
  }, [user, employee]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    dispatch(
      updateProfile({
        name,
        phone,
        avatar,
        skills: skillsArray,
        address,
        emergencyContact
      })
    );
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      setPassSuccess(res.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="page-body">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          My Profile & Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Manage your personal details, emergency contact info, and account credentials
        </p>
      </div>

      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      <div className="grid grid-cols-3">
        {/* Profile Card & Avatar */}
        <div className="card" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name}
              className="avatar"
              style={{ width: '96px', height: '96px', margin: '0 auto 1rem', boxShadow: 'var(--shadow-md)' }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.name}</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email}</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <span className="badge badge-primary">{user?.role?.toUpperCase()}</span>
              <span className="badge badge-secondary">{user?.department}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Employee ID: <strong>{employee?.employeeId || 'EMP-CORE'}</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Designation: <strong>{employee?.designation || 'Specialist'}</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Joined: <strong>{employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'Active'}</strong>
            </div>
          </div>
        </div>

        {/* Profile Details & Password Forms */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personal Info Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <User size={18} color="var(--primary)" /> Personal Information
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills & Competencies (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="React, Node.js, Express, Project Management"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.925rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Emergency Contact
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      className="form-control"
                      value={emergencyContact.relation}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, relation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Key size={18} color="var(--primary)" /> Change Password
              </div>
            </div>

            {passSuccess && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle size={16} /> {passSuccess}
              </div>
            )}

            {passError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <AlertCircle size={16} /> {passError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    placeholder="Confirm password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-secondary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
