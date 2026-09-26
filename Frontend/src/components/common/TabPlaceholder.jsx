import React from 'react';

export const TabPlaceholder = ({ title, stageNumber, description, onBackToDashboard }) => {
  return (
    <div style={{ padding: 'var(--ss-space-8)', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          padding: '1.25rem',
          borderRadius: '50%',
          background: 'var(--ss-primary-subtle)',
          color: 'var(--ss-primary)',
          fontSize: '2rem',
          marginBottom: '1rem',
          border: '1px solid var(--ss-primary-border)',
        }}
      >
        📦
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h2>
      {stageNumber && (
        <span className="ss-badge ss-badge-info" style={{ marginBottom: '1rem' }}>
          DEMO LIFECYCLE STAGE {stageNumber}
        </span>
      )}
      <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        {description || 'This module connects directly to the core inventory lifecycle and will be activated in upcoming phases.'}
      </p>

      <button
        type="button"
        className="ss-btn ss-btn-primary"
        onClick={onBackToDashboard}
      >
        ← Back to Inventory Command Center
      </button>
    </div>
  );
};

export default TabPlaceholder;
