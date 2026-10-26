import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  clearAnnouncementMessage
} from '../store/slices/announcementSlice';
import Modal from '../components/Modal';
import {
  Megaphone,
  Pin,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Filter
} from 'lucide-react';

const AnnouncementsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: announcements, loading, successMessage, error } = useSelector((state) => state.announcements);

  const [filterPriority, setFilterPriority] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    targetAudience: 'all',
    isPinned: false
  });

  const canPost = user?.role === 'hr' || user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearAnnouncementMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createAnnouncement(formData));
    setIsCreateModalOpen(false);
    setFormData({ title: '', content: '', priority: 'medium', targetAudience: 'all', isPinned: false });
    dispatch(fetchAnnouncements());
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      dispatch(deleteAnnouncement(id));
    }
  };

  const filtered = filterPriority
    ? announcements.filter((a) => a.priority === filterPriority)
    : announcements;

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Announcements & Bulletins
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Company-wide updates, events, town halls, and departmental notices
          </p>
        </div>

        {canPost && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Post Announcement
          </button>
        )}
      </div>

      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      {/* Priority Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterPriority('')}
          className={`btn btn-sm ${filterPriority === '' ? 'btn-primary' : 'btn-outline'}`}
        >
          All Updates
        </button>
        <button
          onClick={() => setFilterPriority('high')}
          className={`btn btn-sm ${filterPriority === 'high' ? 'btn-primary' : 'btn-outline'}`}
        >
          Urgent & High Priority
        </button>
        <button
          onClick={() => setFilterPriority('medium')}
          className={`btn btn-sm ${filterPriority === 'medium' ? 'btn-primary' : 'btn-outline'}`}
        >
          General Updates
        </button>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No announcements found matching filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              className="card"
              style={{
                borderLeft: item.isPinned ? '4px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: item.isPinned ? '#fafbff' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.isPinned && (
                    <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                  <span
                    className={`badge ${
                      item.priority === 'high' || item.priority === 'urgent'
                        ? 'badge-danger'
                        : item.priority === 'medium'
                        ? 'badge-warning'
                        : 'badge-secondary'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="badge badge-secondary">
                    Audience: {item.targetAudience.toUpperCase()}
                  </span>
                </div>

                {user?.role === 'hr' && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {item.title}
              </h2>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '1rem' }}>
                {item.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={14} /> Posted by {item.createdBy?.name || 'HR Team'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Broadcast New Announcement">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title / Headline</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Q4 Town Hall Meeting & Employee Awards"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-control"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select
                className="form-control"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              >
                <option value="all">Everyone (All)</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Content Body</label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="Write the full announcement details here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
            />
            <label htmlFor="isPinned" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', margin: 0 }}>
              Pin announcement to top of feed
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
