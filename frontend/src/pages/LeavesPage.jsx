import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyLeaves,
  fetchTeamLeaves,
  fetchAllLeaves,
  applyLeave,
  reviewLeave,
  clearLeaveMessage
} from '../store/slices/leaveSlice';
import Modal from '../components/Modal';
import {
  CalendarCheck2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const LeavesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myLeaves, leaveBalance, teamLeaves, allLeaves, loading, error, successMessage } =
    useSelector((state) => state.leaves);

  const [activeTab, setActiveTab] = useState('my'); // 'my', 'review'
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');

  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const role = user?.role || 'employee';
  const canReview = role === 'manager' || role === 'hr';

  useEffect(() => {
    dispatch(fetchMyLeaves());
    if (role === 'manager') {
      dispatch(fetchTeamLeaves());
    } else if (role === 'hr') {
      dispatch(fetchAllLeaves());
    }
  }, [dispatch, role]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearLeaveMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    await dispatch(applyLeave(formData));
    setIsApplyModalOpen(false);
    setFormData({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
    dispatch(fetchMyLeaves());
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    await dispatch(
      reviewLeave({
        id: selectedLeave._id,
        status: reviewAction,
        reviewComment
      })
    );
    setIsReviewModalOpen(false);
    setReviewComment('');
    if (role === 'manager') dispatch(fetchTeamLeaves());
    if (role === 'hr') dispatch(fetchAllLeaves());
  };

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const reviewList = role === 'hr' ? allLeaves : teamLeaves;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Leave Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Request time off, manage remaining balances, and review team approval requests
          </p>
        </div>

        <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Request Time Off
        </button>
      </div>

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

      {/* Leave Balance Quotas */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Annual Paid Leave
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {leaveBalance?.annual ?? 15} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>days remaining</span>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Sick Leave Quota
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.25rem' }}>
            {leaveBalance?.sick ?? 10} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>days remaining</span>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Casual / Personal Leave
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.25rem' }}>
            {leaveBalance?.casual ?? 8} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>days remaining</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
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
          My Leave History ({myLeaves.length})
        </button>

        {canReview && (
          <button
            onClick={() => setActiveTab('review')}
            className="btn"
            style={{
              borderRadius: '6px 6px 0 0',
              borderBottom: activeTab === 'review' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'review' ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'review' ? 'var(--primary-light)' : 'transparent'
            }}
          >
            Pending Approvals ({reviewList.filter((l) => l.status === 'pending').length})
          </button>
        )}
      </div>

      {/* Tab: My Leaves */}
      {activeTab === 'my' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Dates Range</th>
                  <th>Reason</th>
                  <th>Reviewer Feedback</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      You haven't submitted any leave requests yet.
                    </td>
                  </tr>
                ) : (
                  myLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{leave.totalDays} day(s)</td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} &rarr; {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ maxWidth: '250px' }}>{leave.reason}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {leave.reviewComment || '-'}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            leave.status === 'approved'
                              ? 'badge-success'
                              : leave.status === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {leave.status}
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

      {/* Tab: Team Approvals */}
      {activeTab === 'review' && canReview && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No leave requests to review.
                    </td>
                  </tr>
                ) : (
                  reviewList.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{leave.userId?.name || 'Employee'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{leave.userId?.department}</div>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ textTransform: 'uppercase' }}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{leave.totalDays} day(s)</td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ maxWidth: '220px' }}>{leave.reason}</td>
                      <td>
                        <span
                          className={`badge ${
                            leave.status === 'approved'
                              ? 'badge-success'
                              : leave.status === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {leave.status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openReviewModal(leave, 'approved')}
                              className="btn btn-success btn-sm"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => openReviewModal(leave, 'rejected')}
                              className="btn btn-danger btn-sm"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Reviewed ({leave.reviewComment || 'No remarks'})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Submit Leave Request">
        <form onSubmit={handleApplySubmit}>
          <div className="form-group">
            <label className="form-label">Type of Leave</label>
            <select
              className="form-control"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            >
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual / Personal</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Request</label>
            <textarea
              className="form-control"
              rows={3}
              required
              placeholder="Provide context for manager approval..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsApplyModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`${reviewAction === 'approved' ? 'Approve' : 'Reject'} Leave Request`}
      >
        <form onSubmit={handleReviewSubmit}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
            You are about to <strong>{reviewAction.toUpperCase()}</strong> the {selectedLeave?.leaveType} request for{' '}
            <strong>{selectedLeave?.userId?.name || 'this employee'}</strong> ({selectedLeave?.totalDays} days).
          </p>

          <div className="form-group">
            <label className="form-label">Feedback / Remarks</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Add optional notes for the employee..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsReviewModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${reviewAction === 'approved' ? 'btn-success' : 'btn-danger'}`}
            >
              Confirm {reviewAction === 'approved' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeavesPage;
