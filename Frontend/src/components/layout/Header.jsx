import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_STYLES } from '../../constants/roles';
export const Header = ({ onResetData, isStaffPanel = false, onNavigateTab }) => {
  const { user, role, switchRole } = useAuth();
  const {
    warehouses,
    activeWarehouse,
    setActiveWarehouse,
    notifications = [],
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    clearAllNotifications,
    approveAdjustment,
    rejectAdjustment,
  } = useInventory();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isWarehouseMenuOpen, setIsWarehouseMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const warehouseMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  const badgeStyle = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES[ROLES.INVENTORY_MANAGER];
  const isAdmin = role === ROLES.ADMIN;
  const isStaff = isStaffPanel || role === ROLES.WAREHOUSE_STAFF;

  const unreadCount = (notifications || []).filter((n) => !n.read).length;
  const hasUrgentApproval = (notifications || []).some(
    (n) => !n.read && n.type === 'DISCREPANCY_APPROVAL' && !n.resolved
  );

  // Close profile, warehouse, and notification dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (warehouseMenuRef.current && !warehouseMenuRef.current.contains(event.target)) {
        setIsWarehouseMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setIsNotificationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ss-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--ss-space-6)',
        flexShrink: 0,
        
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Brand & Facility Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ss-space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ss-space-2)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--ss-radius-md)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: 'var(--ss-shadow-glow-primary)',
            }}
          >
            S
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: 'var(--ss-text-primary)' }}>
                StockSense
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--ss-radius-sm)',
                  background: 'var(--ss-primary-subtle)',
                  color: 'var(--ss-primary)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                OPS OS
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Facility / Warehouse Selector */}
        <div style={{ position: 'relative' }} ref={warehouseMenuRef}>
          <button
            type="button"
            onClick={() => setIsWarehouseMenuOpen(!isWarehouseMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              background: 'var(--ss-bg-app)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-md)',
              fontSize: 'var(--ss-text-xs)',
              color: 'var(--ss-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: 'var(--ss-text-muted)' }}>Facility:</span>
            <span style={{ fontWeight: 600, color: 'var(--ss-text-primary)' }}>{activeWarehouse?.name || 'Main DC'}</span>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--ss-success)',
                boxShadow: '0 0 8px var(--ss-success)',
              }}
            />
            <span style={{ fontSize: '0.625rem', color: 'var(--ss-text-muted)' }}>▾</span>
          </button>

          {isWarehouseMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '280px',
                background: 'var(--ss-bg-surface-elevated)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-md)',
                boxShadow: 'var(--ss-shadow-lg)',
                padding: '0.5rem',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>
                Active Warehouse Facility:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(warehouses || []).map((wh) => (
                  <button
                    key={wh.id}
                    type="button"
                    onClick={() => {
                      setActiveWarehouse(wh);
                      setIsWarehouseMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.5rem',
                      background: activeWarehouse?.id === wh.id ? 'var(--ss-primary-subtle)' : 'transparent',
                      border: activeWarehouse?.id === wh.id ? '1px solid var(--ss-primary-border)' : '1px solid transparent',
                      borderRadius: 'var(--ss-radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>{wh.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>{wh.city} • Cap: {wh.capacity}</div>
                    </div>
                    {activeWarehouse?.id === wh.id && <span style={{ color: 'var(--ss-primary)', fontWeight: 800 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>





      {/* Right Controls: Panel Switcher (Manager/Admin Only) & Operator Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ss-space-4)' }}>
        {/* Interactive Panel Switcher — STRICTLY HIDDEN ON STAFF FLOOR PANEL */}
        {!isStaff && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.4rem',
              background: 'var(--ss-bg-app)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-md)',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--ss-text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                paddingLeft: '0.25rem',
              }}
            >
              Panel:
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--ss-bg-surface)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-sm)',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  switchRole(ROLES.INVENTORY_MANAGER);
                  window.location.hash = '#/manager';
                }}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--ss-radius-xs)',
                  border: 'none',
                  background: role === ROLES.INVENTORY_MANAGER ? 'var(--ss-primary)' : 'transparent',
                  color: role === ROLES.INVENTORY_MANAGER ? '#ffffff' : 'var(--ss-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole(ROLES.WAREHOUSE_STAFF);
                  window.location.hash = '#/staff';
                }}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--ss-radius-xs)',
                  border: 'none',
                  background: role === ROLES.WAREHOUSE_STAFF ? 'var(--ss-success)' : 'transparent',
                  color: role === ROLES.WAREHOUSE_STAFF ? '#ffffff' : 'var(--ss-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                Staff Floor
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    switchRole(ROLES.ADMIN);
                  }}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'var(--ss-radius-xs)',
                    border: 'none',
                    background: role === ROLES.ADMIN ? 'var(--ss-warning)' : 'transparent',
                    color: role === ROLES.ADMIN ? '#000000' : 'var(--ss-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  Admin
                </button>
              )}
            </div>
          </div>
        )}

        {/* Real-time Notification Bell & Live Approvals Activity Center */}
        <div style={{ position: 'relative' }} ref={notificationMenuRef}>
          <button
            type="button"
            onClick={() => setIsNotificationMenuOpen((prev) => !prev)}
            title="Notifications & Floor Approvals"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--ss-radius-md)',
              border: isNotificationMenuOpen ? '1px solid var(--ss-primary)' : '1px solid var(--ss-border)',
              background: isNotificationMenuOpen ? 'var(--ss-bg-surface-hover)' : 'var(--ss-bg-app)',
              cursor: 'pointer',
              fontSize: '1.05rem',
              transition: 'all 150ms ease',
            }}
          >
            <span>🔔</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '9999px',
                  backgroundColor: hasUrgentApproval ? 'var(--ss-danger)' : 'var(--ss-warning)',
                  color: '#ffffff',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: hasUrgentApproval ? '0 0 10px rgba(239, 68, 68, 0.7)' : '0 0 6px rgba(245, 158, 11, 0.5)',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {isNotificationMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '390px',
                maxHeight: '480px',
                background: 'var(--ss-bg-surface-elevated)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-lg)',
                boxShadow: 'var(--ss-shadow-xl)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--ss-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-text-primary)' }}>
                    Live Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: hasUrgentApproval ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: hasUrgentApproval ? 'var(--ss-danger)' : 'var(--ss-warning-text)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.6875rem',
                      color: 'var(--ss-primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: '0.8125rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔕</div>
                    No unread notifications or pending actions.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isDiscrepancy = n.type === 'DISCREPANCY_APPROVAL';
                    const isApproved = n.type === 'DISCREPANCY_APPROVED';
                    const isRejected = n.type === 'DISCREPANCY_REJECTED';

                    return (
                      <div
                        key={n.id}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--ss-radius-md)',
                          marginBottom: '0.45rem',
                          background: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                          border: isDiscrepancy && !n.resolved
                            ? '1px solid rgba(245, 158, 11, 0.4)'
                            : n.read
                            ? '1px solid transparent'
                            : '1px solid var(--ss-border)',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>
                              {isDiscrepancy ? '⏳' : isApproved ? '✓' : isRejected ? '✕' : 'ℹ️'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                color: isDiscrepancy ? 'var(--ss-warning-text)' : isApproved ? 'var(--ss-success)' : 'var(--ss-text-primary)',
                              }}
                            >
                              {n.title}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', whiteSpace: 'nowrap' }}>
                            {n.timestamp}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', margin: '0.35rem 0 0.5rem 0', lineHeight: 1.4 }}>
                          {n.message}
                        </p>

                        {/* Interactive Approval Bar for Managers */}
                        {isDiscrepancy && !n.resolved && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border)' }}>
                            {(!isStaff && (role === ROLES.INVENTORY_MANAGER || isAdmin)) ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    approveAdjustment(n.referenceNumber || n.referenceId, user?.name || 'Sarah Chen (Manager)');
                                    markNotificationRead(n.id);
                                  }}
                                  className="ss-btn ss-btn-primary"
                                  style={{
                                    fontSize: '0.6875rem',
                                    padding: '0.2rem 0.5rem',
                                    backgroundColor: 'var(--ss-success)',
                                    borderColor: 'var(--ss-success)',
                                  }}
                                >
                                  ✓ Quick Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    rejectAdjustment(n.referenceNumber || n.referenceId, user?.name || 'Sarah Chen (Manager)');
                                    markNotificationRead(n.id);
                                  }}
                                  className="ss-btn ss-btn-ghost"
                                  style={{ fontSize: '0.6875rem', padding: '0.2rem 0.4rem', color: 'var(--ss-danger)' }}
                                >
                                  ✕ Reject
                                </button>
                                {onNavigateTab && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsNotificationMenuOpen(false);
                                      onNavigateTab('adjustments');
                                    }}
                                    className="ss-btn ss-btn-secondary"
                                    style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', marginLeft: 'auto' }}
                                  >
                                    Review in Adjustments
                                  </button>
                                )}
                              </>
                            ) : (
                              <span style={{ fontSize: '0.6875rem', color: 'var(--ss-warning-text)', fontWeight: 600 }}>
                                🛡️ Designated Reviewer: Sarah Chen (Inventory Lead)
                              </span>
                            )}
                          </div>
                        )}

                        {n.resolved && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--ss-success)', marginTop: '0.25rem', fontWeight: 600 }}>
                            ✓ Resolved by {n.resolvedBy || 'Manager'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div
                  style={{
                    padding: '0.5rem',
                    borderTop: '1px solid var(--ss-border)',
                    textAlign: 'center',
                    background: 'var(--ss-bg-app)',
                  }}
                >
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.6875rem',
                      color: 'var(--ss-text-muted)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ss-danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ss-text-muted)')}
                  >
                    Clear all history
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1-Click Demo Reset Button */}
        {onResetData && (
          <button
            type="button"
            onClick={onResetData}
            title="Reset dataset back to baseline demo state"
            className="ss-btn ss-btn-ghost"
            style={{ fontSize: 'var(--ss-text-xs)', padding: '0.4rem 0.6rem' }}
          >
            ↺ Reset
          </button>
        )}

        {/* Operator Badge with Interactive Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          {!user ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="ss-btn ss-btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem', gap: '0.375rem' }}
            >
              <span>🔐</span>
              <span>Sign In</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                background: isProfileMenuOpen ? 'var(--ss-bg-surface-hover)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--ss-radius-md)',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
              onMouseLeave={(e) => {
                if (!isProfileMenuOpen) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--ss-bg-surface-elevated)',
                  border: '1px solid var(--ss-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: 'var(--ss-primary)',
                }}
              >
                {user?.avatar || 'SC'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 'var(--ss-text-sm)', fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                  {user?.name || 'Sarah Chen'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: badgeStyle.dotColor,
                      fontWeight: 600,
                    }}
                  >
                    {ROLE_LABELS[role] || 'Inventory Manager'}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>▾</span>
                </div>
              </div>
            </button>
          )}

          {/* Profile & Authentication Dropdown */}
          {user && isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '275px',
                background: 'var(--ss-bg-surface-elevated)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-lg)',
                boxShadow: 'var(--ss-shadow-lg)',
                padding: 'var(--ss-space-3)',
                zIndex: 100,
              }}
            >
              {/* Profile Card Header */}
              <div style={{ paddingBottom: '0.625rem', borderBottom: '1px solid var(--ss-border)', marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.4rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      color: 'var(--ss-primary)',
                      border: '1px solid var(--ss-primary-border)',
                      flexShrink: 0,
                    }}
                  >
                    {user?.avatar || 'SC'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ss-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.name || 'Sarah Chen'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email || 'sarah.manager@stocksense.io'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--ss-primary)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                    }}
                  >
                    🛡️ {ROLE_LABELS[role] || 'Inventory Manager'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--ss-success)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ss-success)', display: 'inline-block' }} />
                    Active Shift
                  </span>
                </div>
              </div>

              {/* Facility Authority Details */}
              <div
                style={{
                  padding: '0.5rem 0.625rem',
                  background: 'var(--ss-bg-surface)',
                  borderRadius: 'var(--ss-radius-md)',
                  border: '1px solid var(--ss-border)',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Assigned Authority:
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-primary)' }}>
                  {activeWarehouse?.name || 'WH-01 Main DC (Bay Area)'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✓</span> Full Stock Control & Ledger Authority
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
