import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../store/slices/notificationSlice';
import { Bell, LogOut, User as UserIcon, Check, Clock, ChevronDown, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'hr': return 'badge-danger';
      case 'manager': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
          className="mobile-sidebar-toggle"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <Clock size={16} />
          <span>{currentTime}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: 'var(--text-main)'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--danger)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '320px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: '#f8fafc'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) dispatch(markNotificationRead(n._id));
                        if (n.link) navigate(n.link);
                        setShowNotifMenu(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-light)',
                        backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name}
              className="avatar"
              style={{ width: '38px', height: '38px' }}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {user?.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className={`badge ${getRoleBadgeClass(user?.role)}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {user?.role?.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {user?.department}
                </span>
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '55px',
                width: '200px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                overflow: 'hidden',
                padding: '0.5rem 0'
              }}
            >
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-main)',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <UserIcon size={16} /> My Profile
              </Link>

              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.25rem 0' }} />

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--danger)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-light)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
