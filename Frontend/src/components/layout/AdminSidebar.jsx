import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { ROLES } from '../../constants/roles';

export const AdminSidebar = ({ activeTab, onSelectTab }) => {
  const { user, logout, switchRole } = useAuth();
  const { users, warehouses, locations } = useInventory();

  // Pending user registrations count
  const pendingApprovalsCount = (users || []).filter(
    (u) => u.status === 'PENDING_APPROVAL'
  ).length;

  const navSections = [
    {
      title: 'MAIN',
      items: [
        {
          id: 'dashboard',
          label: 'Admin Dashboard',
          icon: '🛡️',
          badge: null,
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          id: 'users',
          label: 'Users',
          icon: '👥',
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : null,
          badgeVariant: 'warning',
        },
        {
          id: 'roles',
          label: 'Roles / Permissions',
          icon: '🔑',
          badge: '3 Roles',
          badgeVariant: 'neutral',
        },
        {
          id: 'warehouses',
          label: 'Warehouses',
          icon: '🏢',
          badge: `${(warehouses || []).length}`,
          badgeVariant: 'neutral',
        },
        {
          id: 'locations',
          label: 'Locations',
          icon: '📍',
          badge: `${(locations || []).length}`,
          badgeVariant: 'neutral',
        },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        {
          id: 'categories',
          label: 'Categories',
          icon: '🏷️',
          badge: null,
        },
        {
          id: 'units',
          label: 'Units of Measure',
          icon: '📐',
          badge: null,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: '⚙️',
          badge: null,
        },
      ],
    },
    {
      title: 'PROFILE',
      items: [
        {
          id: 'profile',
          label: 'My Profile',
          icon: '👤',
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--ss-bg-surface)',
        borderRight: '1px solid var(--ss-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
        alignSelf: 'flex-start',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Top Nav Items */}
      <div style={{ padding: 'var(--ss-space-4) 0', overflowY: 'auto', flex: 1 }}>
        {/* Role Identity Tag in Sidebar */}
        <div style={{ padding: '0 var(--ss-space-4) var(--ss-space-4)' }}>
          <div
            style={{
              padding: '0.625rem 0.75rem',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--ss-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🛡️</span>
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: 'var(--ss-warning-text)',
                  letterSpacing: '0.04em',
                }}
              >
                ADMIN PANEL
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                System Administration & Governance
              </div>
            </div>
          </div>
        </div>

        {navSections.map((section) => (
          <div key={section.title} style={{ marginBottom: 'var(--ss-space-4)' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--ss-text-muted)',
                letterSpacing: '0.06em',
                padding: '0 var(--ss-space-4)',
                marginBottom: 'var(--ss-space-2)',
              }}
            >
              {section.title}
            </div>

            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.55rem var(--ss-space-4)',
                    background: isActive ? 'var(--ss-primary-subtle)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive
                      ? '3px solid var(--ss-primary)'
                      : '3px solid transparent',
                    color: isActive ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 'var(--ss-text-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--ss-bg-surface-hover)';
                      e.currentTarget.style.color = 'var(--ss-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--ss-text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ss-space-3)' }}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--ss-radius-full)',
                        backgroundColor:
                          item.badgeVariant === 'warning'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'var(--ss-bg-app)',
                        color:
                          item.badgeVariant === 'warning'
                            ? 'var(--ss-warning-text)'
                            : 'var(--ss-text-muted)',
                        border:
                          item.badgeVariant === 'warning'
                            ? '1px solid rgba(245, 158, 11, 0.3)'
                            : '1px solid var(--ss-border)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin Profile & Logout Footer */}
      <div
        style={{
          padding: 'var(--ss-space-3) var(--ss-space-4)',
          borderTop: '1px solid var(--ss-border)',
          backgroundColor: 'var(--ss-bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--ss-warning-text)',
                flexShrink: 0,
              }}
            >
              {user?.avatar || 'MV'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--ss-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Marcus Vance'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-warning-text)', fontWeight: 600 }}>
                System Admin
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            title="My Profile"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'var(--ss-text-muted)',
              padding: '0.25rem',
            }}
          >
            ⚙️
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
