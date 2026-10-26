import React from 'react';

const StatCard = ({ title, value, subtext, subtitle, icon: Icon, color = 'primary' }) => {
  const note = subtext || subtitle;
  const colorMap = {
    primary: { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'rgba(79, 70, 229, 0.2)' },
    success: { bg: 'var(--success-light)', text: 'var(--success)', border: 'rgba(16, 185, 129, 0.2)' },
    warning: { bg: 'var(--warning-light)', text: 'var(--warning)', border: 'rgba(245, 158, 11, 0.2)' },
    danger: { bg: 'var(--danger-light)', text: 'var(--danger)', border: 'rgba(239, 68, 68, 0.2)' },
    secondary: { bg: 'var(--secondary-light)', text: 'var(--secondary)', border: 'rgba(14, 165, 233, 0.2)' }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.2 }}>
            {value}
          </h2>
        </div>
        {Icon && (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>
      {note && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
          {note}
        </div>
      )}
    </div>
  );
};

export default StatCard;
