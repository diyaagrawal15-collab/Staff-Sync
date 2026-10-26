import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTrainings,
  enrollInTraining,
  updateTrainingProgress,
  createTraining,
  clearTrainingMessage
} from '../store/slices/trainingSlice';
import Modal from '../components/Modal';
import {
  GraduationCap,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  PlayCircle,
  BookOpen,
  Award
} from 'lucide-react';

const TrainingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: trainings, loading, successMessage, error } = useSelector((state) => state.trainings);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [activeTraining, setActiveTraining] = useState(null);

  const [newProgress, setNewProgress] = useState(0);
  const [newScore, setNewScore] = useState(90);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    instructor: '',
    durationHours: 8,
    maxCapacity: 30,
    startDate: '',
    endDate: ''
  });

  const canCreate = user?.role === 'hr' || user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchTrainings({ category: selectedCategory }));
  }, [dispatch, selectedCategory]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearTrainingMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleEnroll = async (trainingId) => {
    await dispatch(enrollInTraining(trainingId));
    dispatch(fetchTrainings());
  };

  const handleOpenProgress = (training, currentProgress = 0, currentScore = 90) => {
    setActiveTraining(training);
    setNewProgress(currentProgress);
    setNewScore(currentScore || 90);
    setIsProgressModalOpen(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!activeTraining) return;
    await dispatch(
      updateTrainingProgress({
        id: activeTraining._id,
        progress: newProgress,
        score: newScore
      })
    );
    setIsProgressModalOpen(false);
    dispatch(fetchTrainings());
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createTraining(formData));
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      category: 'Technical',
      instructor: '',
      durationHours: 8,
      maxCapacity: 30,
      startDate: '',
      endDate: ''
    });
    dispatch(fetchTrainings());
  };

  const categories = ['Technical', 'Leadership', 'Compliance', 'Safety', 'Soft Skills'];

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Training & Upskilling Programs
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Explore professional development courses, track progress, and certify skills
          </p>
        </div>

        {canCreate && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> New Training Course
          </button>
        )}
      </div>

      {successMessage && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory('')}
          className={`btn btn-sm ${selectedCategory === '' ? 'btn-primary' : 'btn-outline'}`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Training Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {trainings.map((t) => {
          const myEnrollment = t.enrolledEmployees?.find(
            (ee) => ee.userId === user?._id || ee.userId?._id === user?._id
          );
          const isEnrolled = !!myEnrollment;
          const progress = myEnrollment ? myEnrollment.progress : 0;
          const isCompleted = myEnrollment?.status === 'completed' || progress === 100;

          return (
            <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{t.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} /> {t.durationHours} hrs
                  </span>
                </div>

                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {t.title}
                </h2>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {t.description}
                </p>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Instructor: <strong>{t.instructor}</strong>
                </div>

                {isEnrolled && (
                  <div style={{ margin: '1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      <span>Your Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    {isCompleted && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success-text)', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.35rem' }}>
                        <Award size={14} /> Certificate Completed (Score: {myEnrollment?.score || 95}%)
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
                {!isEnrolled ? (
                  <button
                    onClick={() => handleEnroll(t._id)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <BookOpen size={16} /> Enroll in Course
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenProgress(t, progress, myEnrollment?.score)}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    <PlayCircle size={16} /> Update Progress ({progress}%)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Update Modal */}
      <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Update Learning Progress">
        <form onSubmit={handleProgressSubmit}>
          <div className="form-group">
            <label className="form-label">Course: {activeTraining?.title}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                style={{ flex: 1 }}
                value={newProgress}
                onChange={(e) => setNewProgress(Number(e.target.value))}
              />
              <span style={{ fontWeight: 800, fontSize: '1.25rem', width: '50px' }}>{newProgress}%</span>
            </div>
          </div>

          {newProgress === 100 && (
            <div className="form-group">
              <label className="form-label">Assessment Final Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-control"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsProgressModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Progress
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Course Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Training Program">
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Training Title</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Docker & Kubernetes Production Deployment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Hours)</label>
              <input
                type="number"
                className="form-control"
                required
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructor Name</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Dr. Robert Vance"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Description</label>
            <textarea
              className="form-control"
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Program
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingsPage;
