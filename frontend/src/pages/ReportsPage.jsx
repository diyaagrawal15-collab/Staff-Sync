import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  BarChart3,
  Users,
  Clock,
  DollarSign,
  PieChart,
  CalendarCheck2,
  TrendingUp,
  Download
} from 'lucide-react';

const ReportsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isHR = user?.role === 'hr';

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const url = isHR ? '/reports/hr' : '/reports/manager';
        const res = await api.get(url);
        setReportData(res.data.data);
      } catch (err) {
        console.error('Error fetching analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [isHR]);

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading organizational analytics...</h3>
      </div>
    );
  }

  const { overview, todayAttendance, departmentDistribution, leaveTypeDistribution, payroll, trainingMetrics } =
    reportData || {};

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {isHR ? 'Executive HR Analytics & Reports' : 'Departmental Performance Reports'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Workforce intelligence, attendance percentages, payroll totals, and leave trends
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn btn-outline"
        >
          <Download size={16} /> Print / Export PDF
        </button>
      </div>

      {/* Top Stat Cards */}
      {overview && (
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Total Headcount"
            value={overview.totalEmployees}
            subtext="Active full-time"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Attendance Rate"
            value={`${overview.attendanceRate}%`}
            subtext={`${overview.activeToday} checked in`}
            icon={Clock}
            color="success"
          />
          <StatCard
            title="Leave Requests"
            value={overview.pendingLeaves}
            subtext={`${overview.approvedLeaves} approved this cycle`}
            icon={CalendarCheck2}
            color="warning"
          />
          <StatCard
            title="Avg Compensation"
            value={`$${(payroll?.avgSalary || 0).toLocaleString()}`}
            subtext="Annual per employee"
            icon={DollarSign}
            color="secondary"
          />
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        {/* Today's Attendance Breakdown */}
        {todayAttendance && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--primary)" /> Today's Attendance Breakdown
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>Present On-Time</span>
                  <span style={{ fontWeight: 700 }}>{todayAttendance.present}</span>
                </div>
                <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(todayAttendance.present / (overview?.totalEmployees || 1)) * 100}%`, backgroundColor: 'var(--success)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--warning-text)' }}>Late Arrivals</span>
                  <span style={{ fontWeight: 700 }}>{todayAttendance.late}</span>
                </div>
                <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(todayAttendance.late / (overview?.totalEmployees || 1)) * 100}%`, backgroundColor: 'var(--warning)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--danger-text)' }}>Absent / On Leave</span>
                  <span style={{ fontWeight: 700 }}>{todayAttendance.absent}</span>
                </div>
                <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(todayAttendance.absent / (overview?.totalEmployees || 1)) * 100}%`, backgroundColor: 'var(--danger)' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Distribution */}
        {departmentDistribution && (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Users size={18} color="var(--primary)" /> Department Workforce Distribution
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {departmentDistribution.map((d) => {
                const percentage = Math.round((d.count / (overview?.totalEmployees || 1)) * 100);
                return (
                  <div key={d.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{d.department}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{d.count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: 'var(--primary)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Payroll Analytics & Leave Types */}
      {payroll && (
        <div className="grid grid-cols-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <DollarSign size={18} color="var(--primary)" /> Payroll & Compensation Metrics
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Annual Payroll Total
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  ${payroll.totalPayroll.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Average Compensation
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  ${payroll.avgSalary.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Minimum Bracket
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  ${payroll.minSalary.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Maximum Bracket
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  ${payroll.maxSalary.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Training Completion Rate */}
          {trainingMetrics && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <TrendingUp size={18} color="var(--primary)" /> Training Program Impact
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Employee Enrollments</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{trainingMetrics.totalEnrollments}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Certified Completions</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>{trainingMetrics.completedTrainings}</span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>Overall Completion Rate</span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{trainingMetrics.completionRate}%</span>
                  </div>
                  <div style={{ height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${trainingMetrics.completionRate}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
