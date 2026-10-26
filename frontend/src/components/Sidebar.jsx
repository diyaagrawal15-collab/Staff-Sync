import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck2,
  Megaphone,
  GraduationCap,
  BarChart3,
  UserCheck,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'employee';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['employee', 'manager', 'hr']
    },
    {
      to: '/employees',
      label: role === 'hr' ? 'All Employees' : 'Team Directory',
      icon: Users,
      roles: ['manager', 'hr']
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: Clock,
      roles: ['employee', 'manager', 'hr']
    },
    {
      to: '/leaves',
      label: 'Leave Requests',
      icon: CalendarCheck2,
      roles: ['employee', 'manager', 'hr']
    },
    {
      to: '/announcements',
      label: 'Announcements',
      icon: Megaphone,
      roles: ['employee', 'manager', 'hr']
    },
    {
      to: '/trainings',
      label: 'Training Programs',
      icon: GraduationCap,
      roles: ['employee', 'manager', 'hr']
    },
    {
      to: '/reports',
      label: role === 'hr' ? 'HR Reports & Analytics' : 'Team Performance',
      icon: BarChart3,
      roles: ['manager', 'hr']
    },
    {
      to: '/profile',
      label: 'Personal Profile',
      icon: UserCheck,
      roles: ['employee', 'manager', 'hr']
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #1e293b',
          zIndex: 50,
          transition: 'transform 0.3s ease'
        }}
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: '70px',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              HRM<span style={{ color: 'var(--primary-hover)' }}>Core</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enterprise HRMS
            </div>
          </div>
        </div>

        {/* User Context Banner */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#131e36'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              {role.toUpperCase()} PORTAL
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            {user?.department || 'Organization'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1.25rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>

        {/* Footer info */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
          v1.0.0 Enterprise HRM
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
