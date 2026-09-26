import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const AuthPage = ({ initialTab = 'REGISTER' }) => {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState(initialTab); // 'REGISTER' | 'LOGIN'
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState(ROLES.WAREHOUSE_STAFF);
  const [registerFacility, setRegisterFacility] = useState('WH-01 Main DC (San Francisco)');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!registerName || !registerEmail || !registerPassword) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    try {
      register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
        facility: registerFacility,
      });
    } catch (err) {
      setErrorMessage('Failed to create account. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ss-bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>⚡</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ss-text-primary)', letterSpacing: '-0.03em' }}>
            Stock<span style={{ color: 'var(--ss-primary)' }}>Sense</span>
          </span>
          <span className="ss-badge ss-badge-primary" style={{ fontSize: '0.6875rem' }}>ENTERPRISE WMS</span>
        </div>
        <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
          Role-Based Warehouse Execution & Real-Time Inventory Control Platform
        </p>
      </div>

      {/* Main Auth Card */}
      <div
        className="ss-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2rem',
          boxShadow: 'var(--ss-shadow-lg)',
          border: '1px solid var(--ss-border)',
          backgroundColor: 'var(--ss-bg-surface)',
          borderRadius: 'var(--ss-radius-lg)',
        }}
      >
        {/* View Switcher: First View Register, Second View Login */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.375rem',
            backgroundColor: 'var(--ss-bg-app)',
            padding: '0.3rem',
            borderRadius: 'var(--ss-radius-md)',
            border: '1px solid var(--ss-border)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            className={`ss-btn ${authMode === 'REGISTER' ? 'ss-btn-primary' : 'ss-btn-ghost'}`}
            style={{ fontSize: '0.8125rem', padding: '0.45rem', justifyContent: 'center' }}
            onClick={() => {
              setAuthMode('REGISTER');
              setErrorMessage(null);
            }}
          >
            1. Register / Sign Up
          </button>
          <button
            type="button"
            className={`ss-btn ${authMode === 'LOGIN' ? 'ss-btn-primary' : 'ss-btn-ghost'}`}
            style={{ fontSize: '0.8125rem', padding: '0.45rem', justifyContent: 'center' }}
            onClick={() => {
              setAuthMode('LOGIN');
              setErrorMessage(null);
            }}
          >
            2. Sign In / Login
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--ss-radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--ss-danger)',
              color: 'var(--ss-danger)',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIRST VIEW: REGISTER / SIGN UP                                            */}
        {/* ========================================================================= */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                Create Operational Account
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                Select your role to unlock authorized workflows
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="ss-input"
                placeholder="e.g. Alex Rivera"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Work Email *
              </label>
              <input
                type="email"
                className="ss-input"
                placeholder="e.g. alex.operator@stocksense.io"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Operational Role *
              </label>
              <select
                className="ss-select"
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value={ROLES.WAREHOUSE_STAFF}>
                  📦 Warehouse Staff (Floor Ops: Receiving, Picking, Transfers, Stock Counting)
                </option>
                <option value={ROLES.INVENTORY_MANAGER}>
                  🛡️ Inventory Manager (Governance, Approvals, Catalog & Ledger Control)
                </option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Assigned Warehouse Facility
              </label>
              <select
                className="ss-select"
                value={registerFacility}
                onChange={(e) => setRegisterFacility(e.target.value)}
              >
                <option value="WH-01 Main DC (San Francisco)">WH-01 Main DC (San Francisco, CA)</option>
                <option value="WH-02 Midwest Hub (Chicago)">WH-02 Midwest Hub (Chicago, IL)</option>
                <option value="WH-03 Southern Center (Dallas)">WH-03 Southern Center (Dallas, TX)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Password *
              </label>
              <input
                type="password"
                className="ss-input"
                placeholder="••••••••••••"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="ss-btn ss-btn-primary"
              style={{
                justifyContent: 'center',
                padding: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginTop: '0.5rem',
              }}
            >
              Register & Launch Panel →
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ss-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.75rem',
                  }}
                >
                  Sign In to existing account
                </button>
              </span>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* SECOND VIEW: SIGN IN / LOGIN                                              */}
        {/* ========================================================================= */}
        {authMode === 'LOGIN' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                Sign In to Facility
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
                Sign in with your staff or manager credentials
              </p>
            </div>

            {/* Quick Demo Operator Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Instant Login:
              </div>

              {/* Warehouse Staff Quick Login */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--ss-radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-success)' }}>
                    📦 Warehouse Staff (Floor Ops)
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '1px' }}>
                    alex.operator@stocksense.io
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('alex.operator@stocksense.io');
                    setLoginPassword('staff123');
                    login('alex.operator@stocksense.io', 'staff123');
                  }}
                  className="ss-btn ss-btn-secondary"
                  style={{ fontSize: '0.6875rem', padding: '0.25rem 0.6rem' }}
                >
                  Sign In →
                </button>
              </div>

              {/* Inventory Manager Quick Login */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: 'var(--ss-radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-primary)' }}>
                    🛡️ Inventory Manager (Governance)
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '1px' }}>
                    sarah.manager@stocksense.io
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('sarah.manager@stocksense.io');
                    setLoginPassword('manager123');
                    login('sarah.manager@stocksense.io', 'manager123');
                  }}
                  className="ss-btn ss-btn-secondary"
                  style={{ fontSize: '0.6875rem', padding: '0.25rem 0.6rem' }}
                >
                  Sign In →
                </button>
              </div>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Work Email
                </label>
                <input
                  type="email"
                  className="ss-input"
                  placeholder="e.g. alex.operator@stocksense.io"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="ss-input"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="ss-btn ss-btn-primary"
                style={{
                  justifyContent: 'center',
                  padding: '0.625rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Panel →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  Need a new account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('REGISTER')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ss-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.75rem',
                    }}
                  >
                    Go to Register view
                  </button>
                </span>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
        StockSense Enterprise WMS • Role-Based Execution Engine • Verified Session
      </div>
    </div>
  );
};

export default AuthPage;
