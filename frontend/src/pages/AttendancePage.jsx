import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTodayStatus,
  fetchMyAttendance,
  fetchTeamAttendance,
  fetchAllAttendance,
  clockInAction,
  clockOutAction,
  clearAttendanceMessage
} from '../store/slices/attendanceSlice';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Timer,
  LogIn,
  LogOut,
  MapPin,
  TrendingUp
} from 'lucide-react';

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { todayRecord, history, teamAttendance, allAttendance, loading, error, successMessage } =
    useSelector((state) => state.attendance);

  const [activeTab, setActiveTab] = useState('my'); // 'my', 'team', 'all'
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [clockInNotes, setClockInNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const role = user?.role || 'employee';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(fetchTodayStatus());
    dispatch(fetchMyAttendance());

    if (role === 'manager' || role === 'hr') {
      dispatch(fetchTeamAttendance(filterDate));
    }
    if (role === 'hr') {
      dispatch(fetchAllAttendance({ date: filterDate }));
    }
  }, [dispatch, role, filterDate]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearAttendanceMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleClockIn = () => {
    dispatch(clockInAction({ notes: clockInNotes || 'Regular check-in' }));
    setClockInNotes('');
  };

  const handleClockOut = () => {
    dispatch(clockOutAction());
  };

  // Metrics
  const totalHoursMonth = history.reduce((acc, h) => acc + (h.totalHours || 0), 0);
  const onTimeDays = history.filter((h) => h.status === 'present').length;
  const punctualityRate = history.length > 0 ? Math.round((onTimeDays / history.length) * 100) : 100;

  return (
    <div className="page-body">
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Attendance & Time Tracking
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Real-time check-in, workday duration calculations, shift tracking, and punctuality
        </p>
      </div>

      {/* Notifications */}
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

      {/* Interactive Clock-In Card & Monthly Metric Summary */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Interactive Check-in */}
        <div
          className="card"
          style={{
            gridColumn: 'span 2',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '2px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Live Time Clock
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: '0.25rem 0' }}>
                {currentTime.toLocaleTimeString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} />
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div>
              <span
                className={`badge ${
                  todayRecord?.status === 'present'
                    ? 'badge-success'
                    : todayRecord?.status === 'late'
                    ? 'badge-warning'
                    : 'badge-secondary'
                }`}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
              >
                {todayRecord ? `Status: ${todayRecord.status.toUpperCase()}` : 'Not Clocked In Today'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            {!todayRecord ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Optional note (e.g. Remote work, Office desk 4)"
                  className="form-control"
                  style={{ maxWidth: '360px' }}
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                />
                <button onClick={handleClockIn} disabled={loading} className="btn btn-success" style={{ padding: '0.625rem 1.5rem' }}>
                  <LogIn size={18} /> Clock In Now
                </button>
              </div>
            ) : !todayRecord.clockOut ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Clocked in at {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Note: {todayRecord.notes || 'None'}
                  </div>
                </div>
                <button onClick={handleClockOut} disabled={loading} className="btn btn-danger" style={{ padding: '0.625rem 1.5rem' }}>
                  <LogOut size={18} /> Clock Out Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle size={20} color="var(--success)" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    Workday Completed! ({todayRecord.totalHours} hrs logged)
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    In: {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Out: {new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Monthly Stats */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              <TrendingUp size={18} color="var(--primary)" /> Monthly Performance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Hours Logged
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {totalHoursMonth.toFixed(1)} hrs
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Punctuality & On-Time Rate
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                  {punctualityRate}%
                </div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
            Calculated from last {history.length} logged entries
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('my')}
            className="btn"
            style={{
              borderRadius: '6px 6px 0 0',
              borderBottom: activeTab === 'my' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'my' ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'my' ? 'var(--primary-light)' : 'transparent'
            }}
          >
            My Attendance Records
          </button>

          {(role === 'manager' || role === 'hr') && (
            <button
              onClick={() => setActiveTab('team')}
              className="btn"
              style={{
                borderRadius: '6px 6px 0 0',
                borderBottom: activeTab === 'team' ? '2px solid var(--primary)' : 'none',
                color: activeTab === 'team' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'team' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              Team Attendance Log
            </button>
          )}

          {role === 'hr' && (
            <button
              onClick={() => setActiveTab('all')}
              className="btn"
              style={{
                borderRadius: '6px 6px 0 0',
                borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : 'none',
                color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'all' ? 'var(--primary-light)' : 'transparent'
              }}
            >
              Organization-wide Attendance
            </button>
          )}
        </div>

        {activeTab !== 'my' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Date:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '160px', padding: '0.35rem 0.6rem' }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Tab 1: My History */}
      {activeTab === 'my' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No attendance records found yet. Clock in to begin tracking!
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record._id}>
                      <td style={{ fontWeight: 600 }}>{record.date}</td>
                      <td>
                        {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td>
                        {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td>
                        {record.totalHours ? `${record.totalHours} hrs` : 'In Progress'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            record.status === 'present'
                              ? 'badge-success'
                              : record.status === 'late'
                              ? 'badge-warning'
                              : 'badge-secondary'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Team Attendance */}
      {activeTab === 'team' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Department</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours Logged</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No team members logged attendance for {filterDate}.
                    </td>
                  </tr>
                ) : (
                  teamAttendance.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={rec.userId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                            alt={rec.userId?.name}
                            className="avatar"
                            style={{ width: '32px', height: '32px' }}
                          />
                          <span style={{ fontWeight: 600 }}>{rec.userId?.name}</span>
                        </div>
                      </td>
                      <td>{rec.userId?.department}</td>
                      <td>{rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>{rec.totalHours ? `${rec.totalHours} hrs` : 'In Progress'}</td>
                      <td>
                        <span className={`badge ${rec.status === 'present' ? 'badge-success' : 'badge-warning'}`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Organization-wide Attendance */}
      {activeTab === 'all' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No company records found for {filterDate}.
                    </td>
                  </tr>
                ) : (
                  allAttendance.map((rec) => (
                    <tr key={rec._id}>
                      <td style={{ fontWeight: 600 }}>{rec.userId?.name || 'Employee'}</td>
                      <td>{rec.userId?.department}</td>
                      <td>{rec.date}</td>
                      <td>{rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>
                        <span className={`badge ${rec.status === 'present' ? 'badge-success' : 'badge-warning'}`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
