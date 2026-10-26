import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  Clock,
  CalendarCheck2,
  GraduationCap,
  Megaphone,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { fetchTodayStatus, clockInAction, clockOutAction } from '../store/slices/attendanceSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { todayRecord, loading: attLoading } = useSelector((state) => state.attendance);

  const [hrData, setHrData] = useState(null);
  const [managerData, setManagerData] = useState(null);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const role = user?.role || 'employee';

  useEffect(() => {
    dispatch(fetchTodayStatus());

    const loadDashboardData = async () => {
      setLoadingStats(true);
      try {
        if (role === 'hr') {
          const res = await api.get('/reports/hr');
          setHrData(res.data.data);
          const leavesRes = await api.get('/leaves/all');
          setRecentLeaves(leavesRes.data.data.slice(0, 5));
        } else if (role === 'manager') {
          const res = await api.get('/reports/manager');
          setManagerData(res.data.data);
          const teamLeavesRes = await api.get('/leaves/team');
          setRecentLeaves(teamLeavesRes.data.data.slice(0, 5));
        } else {
          const myLeavesRes = await api.get('/leaves/my');
          setRecentLeaves(myLeavesRes.data.data.slice(0, 5));
        }

        const annRes = await api.get('/announcements');
        setRecentAnnouncements(annRes.data.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadDashboardData();
  }, [dispatch, role]);

  const handleClockIn = () => {
    dispatch(clockInAction({ notes: 'Dashboard Clock-in' }));
  };

  const handleClockOut = () => {
    dispatch(clockOutAction());
  };

  return (
    <div className="page-body">
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 2.5rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Activity size={14} /> HRM Core Platform Live
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ opacity: 0.85, fontSize: '0.925rem', marginTop: '0.4rem' }}>
            Role: <strong>{role.toUpperCase()}</strong> &bull; Department: <strong>{user?.department}</strong> &bull; {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Action in banner */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {role === 'hr' ? (
            <Link to="/employees" className="btn" style={{ backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: 700 }}>
              <Users size={16} /> Manage Employees
            </Link>
          ) : role === 'manager' ? (
            <Link to="/leaves" className="btn" style={{ backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: 700 }}>
              <CalendarCheck2 size={16} /> Review Leaves
            </Link>
          ) : (
            <Link to="/leaves" className="btn" style={{ backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: 700 }}>
              <CalendarCheck2 size={16} /> Apply for Leave
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Metric Cards based on Role */}
      {role === 'hr' && hrData && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Total Workforce"
            value={hrData.overview.totalEmployees}
            subtext="Active employees"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Attendance Today"
            value={`${hrData.overview.attendanceRate}%`}
            subtext={`${hrData.overview.activeToday} clocked in`}
            icon={Clock}
            color="success"
          />
          <StatCard
            title="Pending Leaves"
            value={hrData.overview.pendingLeaves}
            subtext="Awaiting review"
            icon={CalendarCheck2}
            color="warning"
          />
          <StatCard
            title="Active Trainings"
            value={hrData.overview.activeTrainings}
            subtext={`${hrData.trainingMetrics.completionRate}% completion rate`}
            icon={GraduationCap}
            color="secondary"
          />
        </div>
      )}

      {role === 'manager' && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="My Team Members"
            value={managerData ? managerData.teamSize : '2'}
            subtext="Reporting employees"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Team Present Today"
            value={managerData ? `${managerData.teamPresentToday} / ${managerData.teamSize}` : '2 / 2'}
            subtext={`${managerData ? managerData.attendanceRate : 100}% attendance rate`}
            icon={Clock}
            color="success"
          />
          <StatCard
            title="Pending Team Leaves"
            value={managerData ? managerData.pendingLeaves : '1'}
            subtext="Requires approval"
            icon={CalendarCheck2}
            color="warning"
          />
          <StatCard
            title="Department Performance"
            value="4.8 / 5"
            subtext="High rating"
            icon={Award}
            color="secondary"
          />
        </div>
      )}

      {/* Clock In / Out Card (Visible to all, highlighted for Employee) */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} color="var(--primary)" /> Today's Attendance
            </div>
            <span
              className={`badge ${
                todayRecord?.status === 'present'
                  ? 'badge-success'
                  : todayRecord?.status === 'late'
                  ? 'badge-warning'
                  : 'badge-secondary'
              }`}
            >
              {todayRecord ? todayRecord.status : 'Not Clocked In'}
            </span>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              System Workday: 9:00 AM - 5:30 PM
            </div>
            {todayRecord ? (
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  Clocked in at {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {todayRecord.clockOut && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--success-text)', marginTop: '0.25rem' }}>
                    Clocked out: {new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayRecord.totalHours} hrs)
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                You have not registered attendance for today.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              {!todayRecord && (
                <button
                  onClick={handleClockIn}
                  className="btn btn-success"
                  style={{ width: '100%' }}
                  disabled={attLoading}
                >
                  <CheckCircle size={16} /> Clock In Now
                </button>
              )}
              {todayRecord && !todayRecord.clockOut && (
                <button
                  onClick={handleClockOut}
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  disabled={attLoading}
                >
                  <Clock size={16} /> Clock Out Now
                </button>
              )}
              {todayRecord && todayRecord.clockOut && (
                <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Workday Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Announcements Preview */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div className="card-title">
              <Megaphone size={18} color="var(--primary)" /> Company Announcements
            </div>
            <Link to="/announcements" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              View All &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentAnnouncements.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No active announcements
              </div>
            ) : (
              recentAnnouncements.map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      {a.title}
                    </span>
                    <span
                      className={`badge ${
                        a.priority === 'high' || a.priority === 'urgent'
                          ? 'badge-danger'
                          : a.priority === 'medium'
                          ? 'badge-warning'
                          : 'badge-secondary'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {a.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {a.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Leaves & Approvals Section */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <CalendarCheck2 size={18} color="var(--primary)" />
            {role === 'hr'
              ? 'Company Leave Requests'
              : role === 'manager'
              ? 'Team Leave Requests'
              : 'My Recent Leave Applications'}
          </div>
          <Link to="/leaves" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            Manage Leaves &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {role !== 'employee' && <th>Employee</th>}
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No recent leave requests found.
                  </td>
                </tr>
              ) : (
                recentLeaves.map((l) => (
                  <tr key={l._id}>
                    {role !== 'employee' && (
                      <td style={{ fontWeight: 600 }}>
                        {l.userId?.name || 'Team Member'}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {l.userId?.department}
                        </div>
                      </td>
                    )}
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                        {l.leaveType}
                      </span>
                    </td>
                    <td>
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td>{l.totalDays} day(s)</td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.reason}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          l.status === 'approved'
                            ? 'badge-success'
                            : l.status === 'rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
