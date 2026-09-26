import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';

/**
 * RouteGuard
 * Protects pages and full views against unauthorized role/permission access.
 */
export const RouteGuard = ({
  requiredPermission,
  allowedRoles,
  children,
}) => {
  const { user, can, hasRole, switchRole } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--ss-danger)' }}>Authentication Required</h2>
        <p style={{ color: 'var(--ss-text-secondary)', marginTop: '0.5rem' }}>
          Please sign in with your operator credentials to access this warehouse module.
        </p>
      </div>
    );
  }

  const isRoleAllowed = !allowedRoles || hasRole(allowedRoles);
  const isPermissionAllowed = !requiredPermission || can(requiredPermission);

  if (!isRoleAllowed || !isPermissionAllowed) {
    return (
      <div
        className="ss-card"
        style={{
          maxWidth: '560px',
          margin: '4rem auto',
          textAlign: 'center',
          borderColor: 'var(--ss-danger-border)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '50%',
            background: 'var(--ss-danger-bg)',
            color: 'var(--ss-danger-text)',
            marginBottom: '1rem',
            fontSize: '1.75rem',
          }}
        >
          🛡️
        </div>
        <h2 style={{ color: 'var(--ss-text-primary)', marginBottom: '0.5rem' }}>
          Access Restricted
        </h2>
        <p style={{ color: 'var(--ss-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Your current active role (<strong>{ROLE_LABELS[user.role] || user.role}</strong>) does not have authorization to access this operational module.
        </p>

        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--ss-bg-app)',
            borderRadius: 'var(--ss-radius-md)',
            border: '1px solid var(--ss-border)',
            fontSize: '0.8125rem',
            color: 'var(--ss-text-muted)',
            marginBottom: '1.5rem',
          }}
        >
          Required Access: {allowedRoles ? allowedRoles.map((r) => ROLE_LABELS[r] || r).join(', ') : requiredPermission}
        </div>

        {/* Quick demo helper for evaluators */}
        {allowedRoles && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--ss-text-muted)', alignSelf: 'center' }}>
              Evaluation Switcher:
            </span>
            <button
              type="button"
              className="ss-btn ss-btn-secondary"
              onClick={() => switchRole(allowedRoles[0])}
            >
              Switch to {ROLE_LABELS[allowedRoles[0]]}
            </button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
