import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';

export const StaffProfilePage = () => {
  const { user, role, activeWarehouse, logout } = useAuth();

  return (
    <div style={{ padding: 'var(--ss-space-5)', maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ss-text-primary)', margin: 0 }}>
          Operator Profile & Authorization
        </h1>
        <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.8125rem', marginTop: '2px' }}>
          Verified floor identity, device credentials, and role-based execution permissions.
        </p>
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
                {user?.name || 'Alex Rivera'}
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
              Title: <strong>{user?.title || 'Lead Receiving & Putaway Specialist'}</strong>
            </div>
          </div>
        </div>

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
              ● Day Shift (06:00 - 14:30 PST)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Assigned Scanner Terminal
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '2px' }}>
              Zebra TC-52 Mobile #409
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase' }}>
              Primary Floor Zone
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
              Dock Bay 01 & Zone A/C
            </div>
          </div>
        </div>

        {/* Operational Authority Checklist */}
        <div style={{ marginBottom: '1.5rem' }}>
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

        {/* Sign Out Button */}
        <div style={{ borderTop: '1px solid var(--ss-border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={logout}
            style={{ color: 'var(--ss-danger)', borderColor: 'var(--ss-danger-border)', fontWeight: 700 }}
          >
            🚪 Sign Out / End Shift
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
