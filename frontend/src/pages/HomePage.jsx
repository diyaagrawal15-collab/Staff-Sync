import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarCheck2,
  Megaphone,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Briefcase
} from 'lucide-react';

const HomePage = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1300px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              HRM<span style={{ color: 'var(--primary)' }}>Core</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}
        >
          <ShieldCheck size={16} /> Enterprise MERN Human Resource Management System
        </div>

        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto 1.5rem'
          }}
        >
          Streamline Employee Life Cycle, Attendance & Growth in One Unified Platform
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}
        >
          An all-in-one HRMS solution built with Node.js, Express, MongoDB, and React. Empower employees,
          enable department managers, and equip HR leaders with real-time analytics.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Open HRM Portal <ArrowRight size={18} />
          </Link>
          <Link to="/register" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Register New Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '4rem',
            textAlign: 'left'
          }}
        >
          <div className="card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Attendance & Time Tracking</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              1-click real-time clock-in/out, automatic duration calculation, late arrival detection, and monthly logs.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <CalendarCheck2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Leave Management Workflow</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Annual, sick, and casual leave quotas. Multi-level approval by managers and HR with automatic quota deduction.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--warning-light)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <GraduationCap size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Training & Upskilling</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Interactive training course catalog, employee self-enrollment, real-time completion tracking and test scores.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--secondary-light)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Megaphone size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Company Announcements</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Targeted broadcasts by department, priority levels, pinned bulletin notices, and instant notifications.
            </p>
          </div>
        </div>
      </section>

      {/* Role Breakdown Section */}
      <section style={{ backgroundColor: '#f8fafc', padding: '4rem 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Built for Every Role in Your Organization
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Tailored interfaces for Employees, Department Managers, and HR Directors.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Employee */}
            <div className="card" style={{ borderTop: '4px solid var(--secondary)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--secondary)' }}>
                🧑‍💻 Employee Portal
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Clock-in/out and view monthly timecard
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Apply for leaves and check balance quotas
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Enroll in training programs & record progress
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Update personal details and emergency contacts
                </li>
              </ul>
            </div>

            {/* Manager */}
            <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                👨‍💼 Manager Portal
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Review & approve/reject team leave requests
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Monitor live daily team attendance & punctuality
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Track employee performance ratings & skills
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Coordinate departmental training initiatives
                </li>
              </ul>
            </div>

            {/* HR */}
            <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--danger)' }}>
                👩‍💼 HR & Executive Portal
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Full employee directory & onboarding management
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Executive analytics, payroll & attendance rates
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Broadcast company-wide priority bulletins
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" /> Role-based permissions & security administration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        HRM Enterprise System &copy; 2026. Built with React.js, Express, MongoDB & Node.js.
      </footer>
    </div>
  );
};

export default HomePage;
