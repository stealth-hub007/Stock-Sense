import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const AuthPage = ({ initialTab = 'LOGIN', onLoginSuccess }) => {
  const { login, loginUserSession, switchRole } = useAuth();
  const {
    users,
    addUser,
    approveUser,
    warehouses,
    recordSystemActivity,
    addNotification,
  } = useInventory();

  // Mode: 'LOGIN' | 'REGISTER' (Default is LOGIN as requested)
  const [authMode, setAuthMode] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Toast System
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Register State
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState(ROLES.WAREHOUSE_STAFF);
  const [registerFacility, setRegisterFacility] = useState(
    warehouses?.[0]?.name || 'WH-01 Main DC (San Francisco)'
  );

  // Pending Approval Modal / Dialog Box State
  const [pendingApprovalModal, setPendingApprovalModal] = useState(null);
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState(null);

  // Google OAuth Modal / Simulation State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Reset form error or feedback when changing modes
  useEffect(() => {
    setApprovalFeedback(null);
  }, [authMode]);

  // =========================================================================
  // LOGIN SUBMIT HANDLER
  // =========================================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Please enter your work email address.', 'error');
      return;
    }

    setLoading(true);
    const cleanEmail = loginEmail.trim().toLowerCase();

    // Find user in system users database
    const matchedUser = (users || []).find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    // FLOW REQUIREMENT 1:
    // If the email is not found in previous registrations, automatically redirect to register page!
    if (!matchedUser) {
      setLoading(false);
      showToast(
        `🔍 No account found for "${cleanEmail}". Redirecting you to register...`,
        'warning'
      );
      // Pre-fill email in register form and switch view
      setRegisterEmail(cleanEmail);
      setTimeout(() => {
        setAuthMode('REGISTER');
      }, 700);
      return;
    }

    // FLOW REQUIREMENT 2:
    // If user is registered but status is PENDING_APPROVAL:
    // Show dialogue box: "Waiting for approval" and notify admin at that same time!
    if (matchedUser.status === 'PENDING_APPROVAL') {
      setLoading(false);

      // Transmit real-time security alert & notification to Admin
      recordSystemActivity(
        'Auth Gateway',
        'AUTH_ALERT',
        `Operator ${matchedUser.name} attempted sign-in. Pending administrator approval for ${matchedUser.role} at ${matchedUser.facility}.`,
        'WARNING'
      );

      addNotification({
        type: 'APPROVAL_REQUEST',
        title: `⏳ Authorization Requested: ${matchedUser.name}`,
        message: `${matchedUser.name} (${matchedUser.email}) requested terminal clearance for ${matchedUser.role} at ${matchedUser.facility}. Admin action required.`,
        urgency: 'HIGH',
        timestamp: 'Just now',
        targetRole: ROLES.ADMIN,
        userId: matchedUser.id,
        userRole: matchedUser.role,
        userFacility: matchedUser.facility,
      });

      // Open Waiting for Approval Dialogue Box
      setPendingApprovalModal(matchedUser);
      setApprovalFeedback(null);
      return;
    }

    // FLOW REQUIREMENT 3:
    // If user status is SUSPENDED:
    if (matchedUser.status === 'SUSPENDED') {
      setLoading(false);
      showToast(
        '⛔ Account Suspended: Your access has been revoked by an administrator. Please contact system governance.',
        'error'
      );
      return;
    }

    // FLOW REQUIREMENT 4:
    // If user is ACTIVE: Login successfully!
    try {
      // Set session in AuthContext
      const sessionUser = {
        ...matchedUser,
        shiftStatus: 'Active Shift',
        lastActive: 'Just now',
      };

      if (loginUserSession) {
        loginUserSession(sessionUser);
      } else {
        await login(cleanEmail, loginPassword || 'demo123');
      }

      showToast(`✓ Welcome back, ${matchedUser.name}! Logging into terminal...`, 'success');

      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess(sessionUser);
        }, 500);
      }
    } catch (err) {
      showToast('Authentication error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // REGISTER SUBMIT HANDLER
  // =========================================================================
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword) {
      showToast('Please fill in all required registration fields.', 'error');
      return;
    }

    if (registerPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    const cleanEmail = registerEmail.trim().toLowerCase();

    // Check if email already registered
    const exists = (users || []).some((u) => u.email?.toLowerCase() === cleanEmail);
    if (exists) {
      showToast('An account with this email already exists. Please sign in.', 'warning');
      setLoginEmail(cleanEmail);
      setAuthMode('LOGIN');
      return;
    }

    setLoading(true);

    try {
      // Create new operator with status PENDING_APPROVAL
      const newUser = addUser({
        name: registerName.trim(),
        email: cleanEmail,
        role: registerRole,
        facility: registerFacility,
        status: 'PENDING_APPROVAL',
        notes: `Registered via portal on ${new Date().toLocaleDateString()}. Awaiting admin approval.`,
        phone: '+1 (555) 0100',
      });

      // Transmit high-priority notification to Administrator
      addNotification({
        type: 'NEW_REGISTRATION',
        title: `📋 New Operator Registered: ${registerName.trim()}`,
        message: `${registerName.trim()} (${cleanEmail}) submitted application for ${ROLE_LABELS[registerRole] || registerRole} at ${registerFacility}. Approval required.`,
        urgency: 'HIGH',
        timestamp: 'Just now',
        targetRole: ROLES.ADMIN,
        userId: newUser.id,
        userRole: registerRole,
        userFacility: registerFacility,
      });

      recordSystemActivity(
        'Public Portal',
        'APPLICANT_REGISTERED',
        `New applicant ${registerName.trim()} registered with requested role ${registerRole}. Pending administrator authorization.`,
        'INFO'
      );

      // FLOW REQUIREMENT 5:
      // "if the register succesfuilly then he got a toast in which he shows account created succesfully and and now login please"
      showToast(
        '🎉 Account created successfully! Please log in now.',
        'success'
      );

      // Automatically redirect to Login view with newly registered email pre-filled!
      setLoginEmail(cleanEmail);
      setLoginPassword('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setAuthMode('LOGIN');
    } catch (err) {
      showToast('Registration failed. Please check inputs and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // CHECK APPROVAL STATUS IN DIALOGUE BOX
  // =========================================================================
  const handleCheckApprovalStatus = () => {
    if (!pendingApprovalModal) return;
    setCheckingApproval(true);
    setApprovalFeedback(null);

    setTimeout(() => {
      // Re-query users list
      const freshUser = (users || []).find((u) => u.id === pendingApprovalModal.id);

      if (freshUser && freshUser.status === 'ACTIVE') {
        setApprovalFeedback({
          type: 'success',
          message: '✓ Authorization Granted! Administrator has approved your credentials.',
        });
        setTimeout(() => {
          setPendingApprovalModal(null);
          // Log in automatically!
          if (loginUserSession) {
            loginUserSession(freshUser);
          }
          if (onLoginSuccess) {
            onLoginSuccess(freshUser);
          }
        }, 1200);
      } else {
        setApprovalFeedback({
          type: 'pending',
          message: 'Status: Still awaiting review. Administrator has received notification.',
        });
      }
      setCheckingApproval(false);
    }, 600);
  };

  // =========================================================================
  // DEMO FAST-APPROVE BUTTON (Helper for Hackathon Testing / Evaluation)
  // =========================================================================
  const handleSimulateAdminApproval = () => {
    if (!pendingApprovalModal) return;
    approveUser(
      pendingApprovalModal.id,
      pendingApprovalModal.role,
      pendingApprovalModal.facility
    );

    setApprovalFeedback({
      type: 'success',
      message: '✓ Instant Authorization Verified! Logging into terminal...',
    });

    setTimeout(() => {
      const approvedSession = {
        ...pendingApprovalModal,
        status: 'ACTIVE',
        lastActive: 'Just now',
      };
      setPendingApprovalModal(null);
      if (loginUserSession) {
        loginUserSession(approvedSession);
      }
      if (onLoginSuccess) {
        onLoginSuccess(approvedSession);
      }
    }, 1000);
  };

  // =========================================================================
  // SWITCH TO ADMIN ACCOUNT TO REVIEW
  // =========================================================================
  const handleLoginAsAdminToReview = () => {
    setPendingApprovalModal(null);
    const adminUser = (users || []).find((u) => u.role === ROLES.ADMIN) || {
      id: 'op-03',
      name: 'Marcus Vance',
      email: 'marcus.admin@stocksense.io',
      role: ROLES.ADMIN,
      title: 'Warehouse Systems Administrator',
      facility: 'Global Operations Headquarters',
      avatar: 'MV',
    };

    if (loginUserSession) {
      loginUserSession(adminUser);
    }
    showToast('Logged in as Administrator (Marcus Vance). Navigating to Admin Panel...', 'success');
    if (onLoginSuccess) {
      onLoginSuccess(adminUser);
    }
  };

  // =========================================================================
  // GOOGLE OAUTH INTERACTION HANDLER
  // =========================================================================
  const handleGoogleSelect = (googleProfile) => {
    setIsGoogleModalOpen(false);

    // Look up if this Google email is already registered
    const matched = (users || []).find(
      (u) => u.email?.toLowerCase() === googleProfile.email.toLowerCase()
    );

    if (matched) {
      if (matched.status === 'PENDING_APPROVAL') {
        setPendingApprovalModal(matched);
        return;
      }
      if (matched.status === 'ACTIVE') {
        showToast(`✓ Google authentication successful! Welcome, ${matched.name}.`, 'success');
        if (loginUserSession) {
          loginUserSession(matched);
        }
        if (onLoginSuccess) {
          onLoginSuccess(matched);
        }
        return;
      }
    }

    // If not registered: prefill registration form with Google credentials!
    showToast('Google profile linked! Please select your role and facility to complete access request.', 'info');
    setRegisterName(googleProfile.name);
    setRegisterEmail(googleProfile.email);
    setAuthMode('REGISTER');
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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--ss-radius-md)',
            backgroundColor: 'var(--ss-bg-surface-elevated)',
            border:
              toast.type === 'success'
                ? '1px solid var(--ss-success)'
                : toast.type === 'error'
                ? '1px solid var(--ss-danger)'
                : toast.type === 'warning'
                ? '1px solid var(--ss-warning)'
                : '1px solid var(--ss-primary)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(59, 130, 246, 0.2)',
            color: 'var(--ss-text-primary)',
            fontSize: '0.875rem',
            fontWeight: 600,
            maxWidth: '480px',
            animation: 'fadeInDown 200ms ease',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ss-text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.4rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--ss-radius-md)',
              background: 'linear-gradient(135deg, var(--ss-primary) 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            }}
          >
            📦
          </div>
          <span style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--ss-text-primary)', letterSpacing: '-0.03em' }}>
            Stock<span style={{ color: 'var(--ss-primary)' }}>Sense</span>
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--ss-primary)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--ss-radius-full)',
              letterSpacing: '0.04em',
            }}
          >
            ENTERPRISE WMS
          </span>
        </div>
        <p style={{ color: 'var(--ss-text-secondary)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.4 }}>
          Autonomous Execution & Real-Time Role-Based Warehouse Control Platform
        </p>
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2rem',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
          border: '1px solid var(--ss-border)',
          backgroundColor: 'var(--ss-bg-surface)',
          borderRadius: 'var(--ss-radius-xl)',
          zIndex: 1,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Mode Switcher Tabs: 1. Sign In (Initial) | 2. Register */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            backgroundColor: 'var(--ss-bg-app)',
            padding: '4px',
            borderRadius: 'var(--ss-radius-md)',
            border: '1px solid var(--ss-border)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setAuthMode('LOGIN')}
            style={{
              padding: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: 'var(--ss-radius-sm)',
              border: 'none',
              backgroundColor: authMode === 'LOGIN' ? 'var(--ss-primary)' : 'transparent',
              color: authMode === 'LOGIN' ? '#ffffff' : 'var(--ss-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <span>🔐</span>
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('REGISTER')}
            style={{
              padding: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: 'var(--ss-radius-sm)',
              border: 'none',
              backgroundColor: authMode === 'REGISTER' ? 'var(--ss-primary)' : 'transparent',
              color: authMode === 'REGISTER' ? '#ffffff' : 'var(--ss-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <span>📝</span>
            <span>Register</span>
          </button>
        </div>

        {/* Google Authentication Button */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--ss-radius-md)',
              border: '1px solid var(--ss-border)',
              backgroundColor: 'var(--ss-bg-app)',
              color: 'var(--ss-text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: 'var(--ss-shadow-xs)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ss-bg-surface-hover)';
              e.currentTarget.style.borderColor = 'var(--ss-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ss-bg-app)';
              e.currentTarget.style.borderColor = 'var(--ss-border)';
            }}
            title="Authenticate with your official Google Workspace account"
          >
            {/* Official Multi-colored Google SVG Vector */}
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.25rem 0',
            gap: '0.75rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ss-border)' }} />
          <span style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            OR WORKSPACE EMAIL
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ss-border)' }} />
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN IN (INITIAL PAGE)                                            */}
        {/* ========================================================================= */}
        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--ss-text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                Work Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="ss-input"
                  placeholder="name@stocksense.io or applicant email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ paddingLeft: '2.2rem', fontSize: '0.875rem' }}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ss-text-muted)',
                    fontSize: '0.9rem',
                  }}
                >
                  ✉️
                </span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--ss-text-secondary)',
                  }}
                >
                  Password *
                </label>
                <span style={{ fontSize: '0.6875rem', color: 'var(--ss-primary)', cursor: 'pointer' }}>
                  Demo: any password
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="ss-input"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: '2.2rem', paddingRight: '2.2rem', fontSize: '0.875rem' }}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--ss-text-muted)',
                    fontSize: '0.9rem',
                  }}
                >
                  🔒
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ss-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: 0,
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ss-text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  style={{ accentColor: 'var(--ss-primary)' }}
                />
                <span>Remember workstation terminal</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="ss-btn ss-btn-primary"
              style={{
                width: '100%',
                padding: '0.7rem',
                fontSize: '0.875rem',
                fontWeight: 800,
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.25rem',
              }}
            >
              {loading ? (
                <>
                  <span>⏳</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <span>➔</span>
                </>
              )}
            </button>

            {/* Helper to switch to Register */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
              First time here?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('REGISTER')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ss-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: REGISTER ACCOUNT                                                  */}
        {/* ========================================================================= */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--ss-text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                className="ss-input"
                placeholder="e.g. Maya Lin"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                style={{ fontSize: '0.875rem' }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--ss-text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                Work Email *
              </label>
              <input
                type="email"
                className="ss-input"
                placeholder="e.g. maya.lin@candidate.io"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                style={{ fontSize: '0.875rem' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--ss-text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Password *
                </label>
                <input
                  type="password"
                  className="ss-input"
                  placeholder="Min 6 chars"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--ss-text-secondary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="ss-input"
                  placeholder="Confirm password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--ss-text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                Requested Terminal Role *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div
                  onClick={() => setRegisterRole(ROLES.WAREHOUSE_STAFF)}
                  style={{
                    padding: '0.625rem',
                    borderRadius: 'var(--ss-radius-md)',
                    border:
                      registerRole === ROLES.WAREHOUSE_STAFF
                        ? '2px solid var(--ss-success)'
                        : '1px solid var(--ss-border)',
                    backgroundColor:
                      registerRole === ROLES.WAREHOUSE_STAFF
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'var(--ss-bg-app)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                    📦 Staff Floor
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                    Receiving, picking, moves
                  </div>
                </div>

                <div
                  onClick={() => setRegisterRole(ROLES.INVENTORY_MANAGER)}
                  style={{
                    padding: '0.625rem',
                    borderRadius: 'var(--ss-radius-md)',
                    border:
                      registerRole === ROLES.INVENTORY_MANAGER
                        ? '2px solid var(--ss-primary)'
                        : '1px solid var(--ss-border)',
                    backgroundColor:
                      registerRole === ROLES.INVENTORY_MANAGER
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'var(--ss-bg-app)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                    📊 Manager
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>
                    Catalog, ledger, approvals
                  </div>
                </div>
              </div>
            </div>

            {/* Facility Assignment */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--ss-text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                Primary Facility *
              </label>
              <select
                className="ss-input"
                value={registerFacility}
                onChange={(e) => setRegisterFacility(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              >
                {(warehouses || []).map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({w.city || 'Bay Area'})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Registration */}
            <button
              type="submit"
              disabled={loading}
              className="ss-btn ss-btn-primary"
              style={{
                width: '100%',
                padding: '0.7rem',
                fontSize: '0.875rem',
                fontWeight: 800,
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.25rem',
              }}
            >
              <span>Submit Registration Request</span>
              <span>➔</span>
            </button>

            {/* Back to Login */}
            <div style={{ textAlign: 'center', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ss-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Evaluation Chips */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--ss-border)' }}>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: 'var(--ss-text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>⚡ 1-Click Evaluation Shortcuts:</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--ss-primary)' }}>Hackathon Demo Mode</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={() => {
                setLoginEmail('marcus.admin@stocksense.io');
                setLoginPassword('admin123');
                setAuthMode('LOGIN');
              }}
              style={{
                padding: '0.35rem 0.5rem',
                fontSize: '0.6875rem',
                borderRadius: 'var(--ss-radius-sm)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                color: 'var(--ss-warning-text)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🛡️ <strong>Admin</strong> (Marcus)
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginEmail('sarah.manager@stocksense.io');
                setLoginPassword('manager123');
                setAuthMode('LOGIN');
              }}
              style={{
                padding: '0.35rem 0.5rem',
                fontSize: '0.6875rem',
                borderRadius: 'var(--ss-radius-sm)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                color: 'var(--ss-primary)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              📊 <strong>Manager</strong> (Sarah)
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginEmail('alex.operator@stocksense.io');
                setLoginPassword('staff123');
                setAuthMode('LOGIN');
              }}
              style={{
                padding: '0.35rem 0.5rem',
                fontSize: '0.6875rem',
                borderRadius: 'var(--ss-radius-sm)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                color: 'var(--ss-success)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              📦 <strong>Staff</strong> (Alex)
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginEmail('maya.lin@candidate.io');
                setLoginPassword('applicant123');
                setAuthMode('LOGIN');
              }}
              style={{
                padding: '0.35rem 0.5rem',
                fontSize: '0.6875rem',
                borderRadius: 'var(--ss-radius-sm)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                color: '#a78bfa',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              title="Test the Waiting for Approval flow immediately!"
            >
              ⏳ <strong>Pending</strong> (Maya Lin)
            </button>
          </div>
        </div>
      </div>

      {/* Footer System Specs */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--ss-text-muted)', zIndex: 1 }}>
        StockSense Enterprise WMS • Google Auth Compatible • RBAC Protected Terminal Session
      </div>

      {/* ========================================================================= */}
      {/* DIALOGUE BOX: WAITING FOR ADMINISTRATOR APPROVAL                           */}
      {/* ========================================================================= */}
      {pendingApprovalModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--ss-bg-surface-elevated)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--ss-radius-xl)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.25)',
              width: '100%',
              maxWidth: '500px',
              padding: '1.75rem',
              animation: 'fadeInScale 200ms ease',
            }}
          >
            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  color: 'var(--ss-warning-text)',
                  fontSize: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}
              >
                ⏳
              </div>

              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--ss-warning-text)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  letterSpacing: '0.04em',
                }}
              >
                PENDING ADMINISTRATOR APPROVAL
              </span>

              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--ss-text-primary)',
                  margin: '0.5rem 0 0.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Waiting for Administrator Approval
              </h2>

              <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4, margin: 0 }}>
                Your account registration has been transmitted. Access clearance is currently pending review by a system administrator.
              </p>
            </div>

            {/* Operator Card */}
            <div
              style={{
                backgroundColor: 'var(--ss-bg-app)',
                borderRadius: 'var(--ss-radius-md)',
                padding: '0.875rem',
                border: '1px solid var(--ss-border)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--ss-warning-text)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  {pendingApprovalModal.avatar || 'OP'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--ss-text-primary)' }}>
                    {pendingApprovalModal.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                    {pendingApprovalModal.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--ss-border)' }}>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)', display: 'block', fontSize: '0.6875rem' }}>REQUESTED ROLE:</span>
                  <span style={{ fontWeight: 700, color: 'var(--ss-primary)' }}>
                    {ROLE_LABELS[pendingApprovalModal.role] || pendingApprovalModal.role}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--ss-text-muted)', display: 'block', fontSize: '0.6875rem' }}>ASSIGNED FACILITY:</span>
                  <span style={{ fontWeight: 600, color: 'var(--ss-text-secondary)' }}>
                    {pendingApprovalModal.facility}
                  </span>
                </div>
              </div>
            </div>

            {/* Real-Time Live Notification Banner */}
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--ss-radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ fontSize: '1rem' }}>🔔</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--ss-primary)' }}>Administrator Alert Active:</strong> A security notification was transmitted to System Admin (Marcus Vance). This terminal will unlock automatically once approved.
              </div>
            </div>

            {/* Status Feedback Message */}
            {approvalFeedback && (
              <div
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--ss-radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor:
                    approvalFeedback.type === 'success'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                  color:
                    approvalFeedback.type === 'success'
                      ? 'var(--ss-success)'
                      : 'var(--ss-warning-text)',
                  border:
                    approvalFeedback.type === 'success'
                      ? '1px solid var(--ss-success)'
                      : '1px solid var(--ss-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{approvalFeedback.type === 'success' ? '✓' : 'ℹ️'}</span>
                <span>{approvalFeedback.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Check Status */}
              <button
                type="button"
                onClick={handleCheckApprovalStatus}
                disabled={checkingApproval}
                className="ss-btn ss-btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.65rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  gap: '0.5rem',
                }}
              >
                <span>🔄</span>
                <span>{checkingApproval ? 'Checking Approval Status...' : 'Check Approval Status'}</span>
              </button>

              {/* Hackathon Fast-Approve Helper */}
              <button
                type="button"
                onClick={handleSimulateAdminApproval}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  borderRadius: 'var(--ss-radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--ss-success)',
                  cursor: 'pointer',
                }}
                title="Instantly approve this applicant (Testing / Judge Evaluation Mode)"
              >
                <span>⚡</span>
                <span>Simulate Admin Instant Approval (Evaluation Mode)</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handleLoginAsAdminToReview}
                  className="ss-btn ss-btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'center' }}
                  title="Switch to Admin session to approve from the Governance panel"
                >
                  🛡️ Sign In as Admin
                </button>

                <button
                  type="button"
                  onClick={() => setPendingApprovalModal(null)}
                  className="ss-btn ss-btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'center' }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GOOGLE WORKSPACE OAUTH MODAL (INTERACTIVE INTEGRATION READY)               */}
      {/* ========================================================================= */}
      {isGoogleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--ss-bg-surface-elevated)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-xl)',
              boxShadow: 'var(--ss-shadow-xl)',
              width: '100%',
              maxWidth: '440px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Sign in with Google
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'var(--ss-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Choose a Google Workspace account to authenticate with StockSense Enterprise WMS:
            </p>

            {/* Google Accounts Choice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div
                onClick={() =>
                  handleGoogleSelect({
                    name: 'Alex Rivera',
                    email: 'alex.operator@stocksense.io',
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--ss-radius-md)',
                  backgroundColor: 'var(--ss-bg-app)',
                  border: '1px solid var(--ss-border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4285F4', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                  AR
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>Alex Rivera (Staff)</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>alex.operator@stocksense.io</div>
                </div>
              </div>

              <div
                onClick={() =>
                  handleGoogleSelect({
                    name: 'Sarah Chen',
                    email: 'sarah.manager@stocksense.io',
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--ss-radius-md)',
                  backgroundColor: 'var(--ss-bg-app)',
                  border: '1px solid var(--ss-border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#34A853', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                  SC
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>Sarah Chen (Manager)</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>sarah.manager@stocksense.io</div>
                </div>
              </div>

              <div
                onClick={() =>
                  handleGoogleSelect({
                    name: 'Maya Lin',
                    email: 'maya.lin@candidate.io',
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--ss-radius-md)',
                  backgroundColor: 'var(--ss-bg-app)',
                  border: '1px solid var(--ss-border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FBBC05', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                  ML
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>Maya Lin (Applicant)</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>maya.lin@candidate.io</div>
                </div>
              </div>
            </div>

            {/* Integration note */}
            <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', backgroundColor: 'var(--ss-bg-app)', padding: '0.5rem', borderRadius: 'var(--ss-radius-sm)', border: '1px dashed var(--ss-border)' }}>
              <code>// Ready for Google Client ID / Firebase Auth signInWithPopup()</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
