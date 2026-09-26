import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export const StaffSidebar = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const { receipts, deliveries, transfers, adjustments } = useInventory();

  // Compute live operational floor badges
  const pendingReceiptsCount = (receipts || []).filter((r) => r.status === 'PENDING').length;
  const pendingDeliveriesCount = (deliveries || []).filter(
    (d) => d.status === 'READY_TO_DISPATCH' || d.status === 'ALLOCATED' || d.status === 'PICKED'
  ).length;
  const pendingTransfersCount = (transfers || []).filter((t) => t.status === 'SCHEDULED').length;
  const pendingAdjustmentsCount = (adjustments || []).filter((a) => a.status === 'PENDING_APPROVAL').length;
  const totalFloorTasks = pendingReceiptsCount + pendingDeliveriesCount + pendingTransfersCount;

  const navSections = [
    {
      title: 'MAIN',
      items: [
        {
          id: 'dashboard',
          label: 'Warehouse Dashboard',
          icon: '⚡',
          badge: null,
        },
        {
          id: 'tasks',
          label: 'My Tasks',
          icon: '📋',
          badge: totalFloorTasks > 0 ? `${totalFloorTasks} Active` : null,
          badgeVariant: 'warning',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'operations-hub',
          label: 'Operations Work Center',
          icon: '🗄️',
          badge: null,
        },
        {
          id: 'receipts',
          label: 'Receipts',
          icon: '📥',
          badge: pendingReceiptsCount > 0 ? `${pendingReceiptsCount}` : null,
          badgeVariant: 'info',
        },
        {
          id: 'deliveries',
          label: 'Delivery Orders',
          icon: '📦',
          badge: pendingDeliveriesCount > 0 ? `${pendingDeliveriesCount}` : null,
          badgeVariant: 'primary',
        },
        {
          id: 'transfers',
          label: 'Internal Transfers',
          icon: '⇄',
          badge: pendingTransfersCount > 0 ? `${pendingTransfersCount}` : null,
          badgeVariant: 'success',
        },
        {
          id: 'stock-counting',
          label: 'Stock Counting',
          icon: '🎯',
          badge: pendingAdjustmentsCount > 0 ? `${pendingAdjustmentsCount} Pending` : null,
          badgeVariant: 'warning',
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
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--ss-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📦</span>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success)', letterSpacing: '0.04em' }}>
                WAREHOUSE STAFF
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                Floor Execution Engine
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
                letterSpacing: '0.08em',
                padding: '0 var(--ss-space-4) var(--ss-space-2)',
              }}
            >
              {section.title}
            </div>

            <div>
              {section.items.map((item) => {
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                    }}
                    style={{
                      width: 'calc(100% - 1.5rem)',
                      margin: '0.15rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--ss-radius-md)',
                      border: isActive
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : '1px solid transparent',
                      background: isActive
                        ? 'rgba(16, 185, 129, 0.12)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--ss-success)'
                        : item.isLogout
                        ? 'var(--ss-danger)'
                        : 'var(--ss-text-secondary)',
                      fontSize: 'var(--ss-text-sm)',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--ss-bg-surface-hover)';
                        e.currentTarget.style.color = item.isLogout ? 'var(--ss-danger)' : 'var(--ss-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = item.isLogout ? 'var(--ss-danger)' : 'var(--ss-text-secondary)';
                      }
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>

                    {item.badge && (
                      <span
                        className={`ss-badge ss-badge-${item.badgeVariant || 'primary'}`}
                        style={{ fontSize: '0.6875rem', padding: '0.1rem 0.4rem' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Shift Info Footer */}
      <div
        style={{
          padding: 'var(--ss-space-3) var(--ss-space-4)',
          borderTop: '1px solid var(--ss-border)',
          backgroundColor: 'var(--ss-bg-app)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--ss-success)', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-primary)' }}>
            {user?.name || 'Alex Rivera'}
          </span>
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
          Terminal #TC-52 • Bay Area DC
        </div>
      </div>
    </aside>
  );
};

export default StaffSidebar;
