import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';

export const StaffProfilePage = () => {
  const { user, role, activeWarehouse, logout } = useAuth();

  // Local editable staff profile states
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('stocksense_staff_profile_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: user?.name || 'Alex Rivera',
      title: user?.title || 'Lead Receiving & Putaway Specialist',
      terminalId: 'Zebra TC-52 Mobile #409',
      zone: 'Dock Bay 01 & Zone A/C',
      shift: 'Day Shift (06:00 - 14:30 PST)',
      phone: '+1 (415) 555-0182',
      notes: 'Certified for Reach Truck RT-04, Electric Pallet Jack, and HazMat Dock Protocols.',
    };
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('stocksense_staff_profile_custom', JSON.stringify(profileData));
    setIsEditing(false);
    showToast('✓ Operator device credentials and shift profile updated!');
  };

  return (
    <div style={{ padding: 'var(--ss-space-5)', maxWidth: '960px', margin: '0 auto' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 1100,
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--ss-bg-surface-elevated)',
            border: '1px solid var(--ss-success)',
            borderRadius: 'var(--ss-radius-md)',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-success)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
            Operator Profile & Authorization
          </h1>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', marginTop: '2px' }}>
            Verified floor identity, device credentials, and role-based execution permissions.
          </p>
        </div>

        <button
          type="button"
          className="ss-btn ss-btn-secondary"
          onClick={() => setIsEditing(!isEditing)}
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem' }}
        >
          {isEditing ? '✕ Cancel Editing' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* Main Profile Card */}
      <div
        className="ss-card"
        style={{
          padding: '2rem',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-lg)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--ss-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--ss-success)',
            }}
          >
            {user?.avatar || 'AR'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
                {profileData.name}
              </h2>
              {/* EXPLICIT ROLE BADGE: WAREHOUSE STAFF */}
              <span
                className="ss-badge ss-badge-success"
                style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem' }}
              >
                📦 {ROLE_LABELS[role] || 'Warehouse Staff'}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
              {user?.email || 'alex.operator@stocksense.io'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '4px' }}>
              Title: <strong>{profileData.title}</strong>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', border: '1px solid var(--ss-border)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--ss-text-primary)' }}>
              ✏️ Edit Terminal Credentials & Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Operator Name
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Job Title
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Assigned Scanner Terminal
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={profileData.terminalId}
                  onChange={(e) => setProfileData({ ...profileData, terminalId: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                  Primary Floor Zone
                </label>
                <input
                  type="text"
                  className="ss-input"
                  value={profileData.zone}
                  onChange={(e) => setProfileData({ ...profileData, zone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.35rem' }}>
                Shift Notes & Equipment Certifications
              </label>
              <textarea
                className="ss-input"
                rows={2}
                value={profileData.notes}
                onChange={(e) => setProfileData({ ...profileData, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ss-btn ss-btn-primary"
                style={{ fontWeight: 700 }}
              >
                ✓ Save Profile
              </button>
            </div>
          </form>
        ) : null}

        {/* Clear Role Distinction Callout (Explicitly NOT Manager, NOT Admin) */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--ss-radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-success)', marginBottom: '0.25rem' }}>
            ✓ Verified Role: Warehouse Staff
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            This account operates strictly with <strong>Warehouse Staff floor execution authority</strong>.
            This user is <strong>NOT an Inventory Manager</strong> and <strong>NOT a System Admin</strong>.
            High-level catalog pricing edits, SKU deletions, and financial variance sign-offs are restricted and governed by managers.
          </p>
        </div>

        {/* Facility & Shift Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--ss-bg-app)',
            border: '1px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Assigned Facility
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
              {activeWarehouse?.name || 'WH-01 Main DC (San Francisco)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Floor Shift Status
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-success)', marginTop: '2px' }}>
              ● {profileData.shift}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Assigned Scanner Terminal
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '2px' }}>
              {profileData.terminalId}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Primary Floor Zone
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
              {profileData.zone}
            </div>
          </div>
        </div>

        {/* Notes & Equipment */}
        {profileData.notes && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--ss-bg-app)',
              border: '1px solid var(--ss-border-subtle)',
              borderRadius: 'var(--ss-radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.75rem',
              color: 'var(--ss-text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--ss-text-primary)' }}>Operator Certifications & Notes: </strong>
            {profileData.notes}
          </div>
        )}

        {/* Operational Authority Checklist */}
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginBottom: '0.75rem' }}>
            Operational Permissions & Limits:
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <div style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-sm)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 700 }}>✓ INBOUND RECEIVING: </span>
              Unload, inspect and intake shipments
            </div>
            <div style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-sm)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 700 }}>✓ ORDER PICKING: </span>
              Pick inventory from primary bins
            </div>
            <div style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-sm)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 700 }}>✓ CARTON PACKING: </span>
              Box, seal and label customer deliveries
            </div>
            <div style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-sm)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 700 }}>✓ BIN RELOCATION: </span>
              Shift stock between internal locations
            </div>
            <div style={{ padding: '0.625rem 0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-sm)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 700 }}>✓ PHYSICAL COUNTING: </span>
              Log floor counts and record variances
            </div>
            <div style={{ padding: '0.625rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--ss-radius-sm)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--ss-danger)', fontWeight: 700 }}>✕ RESTRICTED: </span>
              Cannot approve write-offs (Routes to Manager)
            </div>
          </div>
        </div>

        {/* Terminal Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--ss-border)' }}>
          <button
            type="button"
            onClick={logout}
            className="ss-btn ss-btn-ghost"
            style={{ fontSize: '0.8125rem', color: 'var(--ss-danger)', gap: '0.375rem' }}
          >
            <span>🚪</span>
            <span>Sign Out / Lock Terminal</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default StaffProfilePage;
