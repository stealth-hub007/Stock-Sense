import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_STYLES } from '../../constants/roles';
import { AuthModal } from '../auth/AuthModal';

export const Header = ({ onResetData }) => {
  const { user, role, logout } = useAuth();
  const { warehouses, activeWarehouse, setActiveWarehouse } = useInventory();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isWarehouseMenuOpen, setIsWarehouseMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const warehouseMenuRef = useRef(null);

  const badgeStyle = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES[ROLES.INVENTORY_MANAGER];
  const isAdmin = role === ROLES.ADMIN;

  // Close profile and warehouse dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (warehouseMenuRef.current && !warehouseMenuRef.current.contains(event.target)) {
        setIsWarehouseMenuOpen(false);
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
        position: 'sticky',
        top: 0,
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

      {/* Center: Realtime Telemetry */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ss-space-4)',
          fontSize: 'var(--ss-text-xs)',
          color: 'var(--ss-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ color: 'var(--ss-success)' }}>●</span>
          <span>Ledger Integrity: <strong style={{ color: 'var(--ss-text-primary)', fontFamily: 'var(--ss-font-mono)' }}>99.98%</strong></span>
        </div>
        <span style={{ color: 'var(--ss-border)' }}>|</span>
        <div>
          Latency: <strong style={{ color: 'var(--ss-text-primary)', fontFamily: 'var(--ss-font-mono)' }}>14ms</strong>
        </div>
      </div>

      {/* Right Controls: Role Switcher (Admin Only) & Operator Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ss-space-4)' }}>
        {/* Panel Switcher — STRICTLY VISIBLE ONLY FOR ADMIN */}
        {isAdmin && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.2rem 0.5rem',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--ss-radius-md)',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--ss-warning-text)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Admin View:
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--ss-bg-app)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-sm)',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => switchRole(ROLES.INVENTORY_MANAGER)}
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
                onClick={() => switchRole(ROLES.WAREHOUSE_STAFF)}
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
                Staff
              </button>
              <button
                type="button"
                onClick={() => switchRole(ROLES.ADMIN)}
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
            </div>
          </div>
        )}

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

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="ss-btn ss-btn-primary"
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.48rem', justifyContent: 'center', gap: '0.375rem', fontWeight: 600 }}
                >
                  <span>⚡</span>
                  <span>Sign In / Sign Up / OTP Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="ss-btn ss-btn-ghost"
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center', color: 'var(--ss-text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ss-danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ss-text-muted)')}
                >
                  <span>Sign Out / Lock Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Modal (Login, Signup, OTP Password Reset) */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};

export default Header;
