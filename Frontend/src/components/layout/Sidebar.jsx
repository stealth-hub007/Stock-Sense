import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNavigationForRole } from '../../config/navigation';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { role, permissions } = useAuth();
  const navItems = getNavigationForRole(role, permissions);

  // Group items by category
  const categories = [
    { key: 'OVERVIEW', title: 'OPERATIONS OVERVIEW' },
    { key: 'INVENTORY', title: 'INVENTORY MASTER' },
    { key: 'OPERATIONS', title: 'STOCK LIFECYCLE' },
    { key: 'AUDIT', title: 'COMPLIANCE & AUDIT' },
    { key: 'INTELLIGENCE', title: 'REPORTS & ALERTS' },
    { key: 'FACILITIES', title: 'FACILITY LAYOUT' },
    { key: 'ADMINISTRATION', title: 'GOVERNANCE' },
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
      }}
    >
      <div style={{ padding: 'var(--ss-space-4) 0', overflowY: 'auto' }}>
        {categories.map((category) => {
          const itemsInCategory = navItems.filter((item) => item.category === category.key);
          if (itemsInCategory.length === 0) return null;

          return (
            <div key={category.key} style={{ marginBottom: 'var(--ss-space-4)' }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: 'var(--ss-text-muted)',
                  letterSpacing: '0.08em',
                  padding: '0 var(--ss-space-4) var(--ss-space-2)',
                }}
              >
                {category.title}
              </div>

              <div>
                {itemsInCategory.map((item) => {
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      style={{
                        width: 'calc(100% - 1.5rem)',
                        margin: '0.15rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--ss-radius-md)',
                        border: isActive ? '1px solid var(--ss-primary-border)' : '1px solid transparent',
                        background: isActive ? 'var(--ss-primary-subtle)' : 'transparent',
                        color: isActive ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
                        fontSize: 'var(--ss-text-sm)',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 150ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--ss-bg-surface-hover)';
                          e.currentTarget.style.color = 'var(--ss-text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--ss-text-secondary)';
                        }
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{item.label}</span>
                      </span>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: 'var(--ss-radius-full)',
                            background: isActive ? 'rgba(79, 70, 229, 0.15)' : '#f1f5f9',
                            color: isActive ? 'var(--ss-primary)' : 'var(--ss-text-muted)',
                            border: isActive ? '1px solid var(--ss-primary-border)' : '1px solid var(--ss-border)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Shift Status Footer */}
      <div
        style={{
          padding: 'var(--ss-space-4)',
          borderTop: '1px solid var(--ss-border)',
          background: 'var(--ss-bg-app)',
          margin: 'var(--ss-space-2)',
          borderRadius: 'var(--ss-radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>DOUBLE-ENTRY LEDGER</span>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ss-success)' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4 }}>
          All stock deltas generate immutable audit records.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
