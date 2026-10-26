import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Users } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(clearError());
    dispatch(loginUser({ email: demoEmail, password: demoPassword }));
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
      <div style={{ maxWidth: '460px', width: '100%' }}>
        {/* Brand Header */}
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
            Sign In to HRM Core
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Enterprise Human Resource Management System
          </p>
        </div>

        {/* Expired Session Notice */}
        {searchParams.get('expired') && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning-text)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} /> Your session has expired. Please sign in again.
          </div>
        )}

        {/* Error Alert */}
        {error && (
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
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
              ⚡ 1-Click Demo Accounts
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('hr@example.com', 'Password123!')}
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <ShieldCheck size={16} color="var(--danger)" />
                <span style={{ fontWeight: 600 }}>HR Director:</span> hr@example.com
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@example.com', 'Password123!')}
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <Users size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Manager:</span> manager@example.com
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@example.com', 'Password123!')}
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <UserCheck size={16} color="var(--success)" />
                <span style={{ fontWeight: 600 }}>Employee:</span> alex@example.com
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register as Employee
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
