import React, { useState } from 'react';
import { useAuth, DEMO_OPERATORS } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const AuthModal = ({ isOpen, onClose }) => {
  const { user, loginAs, logout } = useAuth();
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState(ROLES.INVENTORY_MANAGER);
  const [signupFacility, setSignupFacility] = useState('WH-01 Main DC (Bay Area)');

  // OTP Reset form
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState(null);

  const [toast, setToast] = useState(null);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail) return;

    // Check if matching demo operator or custom
    const match = DEMO_OPERATORS.find((op) => op.email.toLowerCase() === loginEmail.toLowerCase());
    if (match) {
      loginAs(match.role);
      showNotification(`✓ Logged in as ${match.name} (${ROLE_LABELS[match.role]})`);
      setTimeout(onClose, 800);
    } else {
      // Mock custom account login
      const customUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: loginEmail.split('@')[0].toUpperCase(),
        email: loginEmail,
        role: ROLES.INVENTORY_MANAGER,
        title: 'Inventory Manager',
        facility: 'WH-01 Main DC (Bay Area)',
        avatar: loginEmail.slice(0, 2).toUpperCase(),
        shiftStatus: 'Active Session',
      };
      localStorage.setItem('stocksense_operator', JSON.stringify(customUser));
      loginAs(ROLES.INVENTORY_MANAGER);
      showNotification(`✓ Authenticated: ${customUser.name}`);
      setTimeout(onClose, 800);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail) return;

    const initials = signupName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'OP';
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: signupName,
      email: signupEmail,
      role: signupRole,
      title: ROLE_LABELS[signupRole],
      facility: signupFacility,
      avatar: initials,
      shiftStatus: 'Active Session',
    };

    localStorage.setItem('stocksense_operator', JSON.stringify(newUser));
    loginAs(signupRole);
    showNotification(`✓ Account created! Welcome, ${signupName}`);
    setTimeout(onClose, 800);
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setOtpCode('842910'); // Simulated generated OTP
    setOtpSentNotice(`✓ 6-Digit OTP code [842910] sent to ${resetEmail}`);
    setResetStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode !== '842910') {
      showNotification('Invalid OTP code. Please use 842910.');
      return;
    }
    setResetStep(3);
  };

  const handleCompletePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match.');
      return;
    }
    showNotification('✓ Password successfully updated! Signing you in...');
    loginAs(ROLES.INVENTORY_MANAGER);
    setTimeout(onClose, 1000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 15, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
      }}
    >
      <div
        className="ss-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--ss-bg-surface)',
          border: '1px solid var(--ss-border)',
          borderRadius: 'var(--ss-radius-lg)',
          boxShadow: 'var(--ss-shadow-lg)',
          padding: '2rem',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--ss-text-muted)',
            fontSize: '1.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>⚡</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ss-text-primary)', letterSpacing: '-0.02em' }}>
              Stock<span style={{ color: 'var(--ss-primary)' }}>Sense</span> ID
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
            Enterprise Role-Based Access Control & Identity Service
          </p>
        </div>

        {/* Notification Toast */}
        {toast && (
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--ss-radius-md)',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid var(--ss-success)',
              color: 'var(--ss-success)',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {toast}
          </div>
        )}

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.375rem',
            backgroundColor: 'var(--ss-bg-surface-elevated)',
            padding: '0.25rem',
            borderRadius: 'var(--ss-radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            className={`ss-btn ${authMode === 'LOGIN' ? 'ss-btn-primary' : 'ss-btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
            onClick={() => setAuthMode('LOGIN')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`ss-btn ${authMode === 'SIGNUP' ? 'ss-btn-primary' : 'ss-btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
            onClick={() => setAuthMode('SIGNUP')}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`ss-btn ${authMode === 'FORGOT_PASSWORD' ? 'ss-btn-primary' : 'ss-btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.4rem', justifyContent: 'center' }}
            onClick={() => {
              setAuthMode('FORGOT_PASSWORD');
              setResetStep(1);
            }}
          >
            Reset OTP
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: LOGIN                                                  */}
        {/* ------------------------------------------------------------- */}
        {authMode === 'LOGIN' && (
          <div>
            {/* Quick Demo Operator Picker */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instant Demo Profile Sign In
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {DEMO_OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      loginAs(op.role);
                      showNotification(`✓ Switched to ${op.name} (${ROLE_LABELS[op.role]})`);
                      setTimeout(onClose, 600);
                    }}
                    className="ss-card"
                    style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: user?.role === op.role ? '1px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                      backgroundColor: user?.role === op.role ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    }}
                  >
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{op.avatar}</div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>{op.name}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--ss-text-muted)' }}>{ROLE_LABELS[op.role].split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ss-border)' }} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>OR ENTER CREDENTIALS</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ss-border)' }} />
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="ss-input"
                  placeholder="e.g. sarah.manager@stocksense.io"
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--ss-text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember session
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('FORGOT_PASSWORD');
                    setResetStep(1);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--ss-primary)', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="ss-btn ss-btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                Sign In to StockSense
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: SIGN UP                                                */}
        {/* ------------------------------------------------------------- */}
        {authMode === 'SIGNUP' && (
          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Full Name
              </label>
              <input
                type="text"
                className="ss-input"
                placeholder="e.g. James Wilson"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Work Email
              </label>
              <input
                type="email"
                className="ss-input"
                placeholder="e.g. james.w@stocksense.io"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Operational Role
              </label>
              <select
                className="ss-select"
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
              >
                <option value={ROLES.INVENTORY_MANAGER}>Inventory Manager (Full Operations & Ledger)</option>
                <option value={ROLES.WAREHOUSE_STAFF}>Warehouse Staff (Receiving & Relocation)</option>
                <option value={ROLES.ADMIN}>System Administrator (Security & Settings)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Assigned Warehouse Facility
              </label>
              <select
                className="ss-select"
                value={signupFacility}
                onChange={(e) => setSignupFacility(e.target.value)}
              >
                <option value="WH-01 Main DC (Bay Area)">WH-01 Main DC (San Francisco, CA)</option>
                <option value="WH-02 Midwest Hub (Chicago)">WH-02 Midwest Hub (Chicago, IL)</option>
                <option value="WH-03 Southern Center (Dallas)">WH-03 Southern Center (Dallas, TX)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                Password
              </label>
              <input
                type="password"
                className="ss-input"
                placeholder="Minimum 8 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="ss-btn ss-btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              Create Account & Sign In
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: OTP PASSWORD RESET                                     */}
        {/* ------------------------------------------------------------- */}
        {authMode === 'FORGOT_PASSWORD' && (
          <div>
            {resetStep === 1 && (
              <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>📧</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                    Request Password Reset OTP
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.25rem' }}>
                    Enter your account email to receive a 6-digit One-Time Password.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    className="ss-input"
                    placeholder="e.g. sarah.manager@stocksense.io"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="ss-btn ss-btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                  Send 6-Digit OTP Code →
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>🔒</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                    Enter 6-Digit OTP Code
                  </h4>
                  {otpSentNotice && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--ss-success)', marginTop: '0.25rem', fontWeight: 600 }}>
                      {otpSentNotice}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    One-Time Password (OTP)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    className="ss-input"
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 800 }}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', textAlign: 'center', marginTop: '0.375rem' }}>
                    Demo testing OTP is <strong>842910</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="ss-btn ss-btn-secondary"
                    onClick={() => setResetStep(1)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    ← Back
                  </button>
                  <button type="submit" className="ss-btn ss-btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                    Verify OTP →
                  </button>
                </div>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleCompletePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>🔑</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                    Set New Password
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.25rem' }}>
                    OTP verified successfully! Create a new secure password.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    className="ss-input"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="ss-input"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="ss-btn ss-btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                  Save & Sign In
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default AuthModal;
