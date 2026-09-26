import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const AdminProfilePage = () => {
  const { user, logout, switchRole } = useAuth();

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: 'var(--ss-space-6)' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--ss-text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Administrator Profile & Credentials
        </h1>
        <p
          style={{
            fontSize: 'var(--ss-text-sm)',
            color: 'var(--ss-text-secondary)',
            marginTop: '0.25rem',
          }}
        >
          Active session identity, security clearances, and system authorization keys.
        </p>
      </div>

      {/* Main Profile Card */}
      <div
        style={{
          backgroundColor: 'var(--ss-bg-surface)',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-lg)',
          padding: 'var(--ss-space-6)',
          boxShadow: 'var(--ss-shadow-sm)',
          marginBottom: 'var(--ss-space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--ss-warning-text)',
              fontSize: '1.5rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {user?.avatar || 'MV'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                {user?.name || 'Marcus Vance'}
              </h2>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--ss-warning-text)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                ADMINISTRATOR
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
              {user?.email || 'marcus.admin@stocksense.io'} • Warehouse Systems Administrator
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '4px' }}>
              Assigned Facility: {user?.facility || 'Global Operations Headquarters'}
            </div>
          </div>
        </div>

        {/* Security & Access Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>AUTHORIZATION LEVEL</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-warning-text)', marginTop: '2px' }}>
              Unrestricted Superuser
            </div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>SESSION STATUS</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-success)', marginTop: '2px' }}>
              ✓ Authenticated & Verified
            </div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700 }}>SECURITY CREDENTIAL</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '2px' }}>
              PKI-2026-ADM
            </div>
          </div>
        </div>

        {/* Administrative Capabilities Checklist */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Active Administrative Privileges:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ss-text-secondary)' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 800 }}>✓</span>
              <span>Full User Governance & Approval Gatekeeper Authority</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ss-text-secondary)' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 800 }}>✓</span>
              <span>Warehouse Facility Network & Bin Topology Control</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ss-text-secondary)' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 800 }}>✓</span>
              <span>Units of Measure (UOM) & Product Categories Configuration</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ss-text-secondary)' }}>
              <span style={{ color: 'var(--ss-success)', fontWeight: 800 }}>✓</span>
              <span>System-wide Emergency Maintenance Mode Toggle</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--ss-border)' }}>
          <button
            type="button"
            onClick={logout}
            className="ss-btn ss-btn-ghost"
            style={{ fontSize: '0.8125rem', color: 'var(--ss-danger)' }}
          >
            🚪 Logout Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
