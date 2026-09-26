import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_STYLES } from '../../constants/roles';
import { AuthModal } from '../auth/AuthModal';

export const Header = ({ onResetData }) => {
  const { user, role, switchRole, demoOperators } = useAuth();
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
        backgroundColor: 'var(--ss-bg-surface)',
        borderBottom: '1px solid var(--ss-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--ss-space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--ss-radius-md)',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ss-bg-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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

          {/* Profile & Switch Operator Dropdown */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                background: 'var(--ss-bg-surface-elevated)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-lg)',
                boxShadow: 'var(--ss-shadow-lg)',
                padding: 'var(--ss-space-3)',
                zIndex: 100,
              }}
            >
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--ss-border)', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  {user?.email}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--ss-primary)', fontWeight: 600, marginTop: '2px' }}>
                  {ROLE_LABELS[role]}
                </div>
              </div>

              {/* Role / Operator Quick Switch */}
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Switch Operator Session:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {demoOperators.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      switchRole(op.role);
                      setIsProfileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.5rem',
                      background: op.role === role ? 'var(--ss-primary-subtle)' : 'transparent',
                      border: op.role === role ? '1px solid var(--ss-primary-border)' : '1px solid transparent',
                      borderRadius: 'var(--ss-radius-sm)',
                      color: op.role === role ? 'var(--ss-text-primary)' : 'var(--ss-text-secondary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{op.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>{ROLE_LABELS[op.role]}</div>
                    </div>
                    {op.role === role && <span style={{ color: 'var(--ss-primary)', fontWeight: 700 }}>✓</span>}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="ss-btn ss-btn-primary"
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'center' }}
                >
                  ⚡ Sign In / Sign Up / OTP Reset
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
