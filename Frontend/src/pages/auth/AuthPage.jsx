import React, { useState, useCallback } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

/* ─── Google OAuth Config ─── */
const GOOGLE_CLIENT_ID = '154885124960-4eigr37147cm2nrsflkrpbd5mp6rqitc.apps.googleusercontent.com';

/* Decode a JWT without verifying signature (client-side only) */
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

/* ─── CSS ─── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }

  .ap-wrap { min-height:100vh; display:flex; font-family:'Plus Jakarta Sans',system-ui,sans-serif; background:#f8fafc; }

  /* Left brand panel */
  .ap-brand {
    display:none; width:44%; min-height:100vh;
    background:linear-gradient(145deg,#4f46e5 0%,#6366f1 55%,#818cf8 100%);
    position:relative; overflow:hidden;
    flex-direction:column; justify-content:center; padding:3rem 3.5rem;
  }
  @media(min-width:900px){ .ap-brand{display:flex} }
  .ap-orb{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none}

  .ap-right {
    flex:1; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:2.5rem 1rem; overflow-y:auto;
  }

  .ap-card {
    width:100%; max-width:470px; background:#fff;
    border-radius:20px; border:1px solid #e2e8f0;
    box-shadow:0 8px 32px -8px rgba(15,23,42,.12),0 0 0 1px rgba(15,23,42,.04);
    overflow:hidden; animation:fadeUp .35s cubic-bezier(.16,1,.3,1) both;
  }

  .ap-tabs { display:flex; gap:4px; padding:6px; background:#f1f5f9; border-bottom:1px solid #e2e8f0; }
  .ap-tab {
    flex:1; padding:.6rem .75rem; border:none; background:transparent;
    font-family:inherit; font-size:.875rem; font-weight:700;
    cursor:pointer; transition:all 150ms ease; border-radius:10px; color:#64748b;
  }
  .ap-tab.on { background:#fff; color:#4f46e5; box-shadow:0 1px 4px rgba(15,23,42,.12); }
  .ap-tab:not(.on):hover { color:#0f172a; background:rgba(255,255,255,.5); }

  .ap-body { padding:2rem 2.25rem 2.5rem; }

  .ap-input {
    width:100%; background:#f8fafc; border:1.5px solid #e2e8f0;
    border-radius:10px; padding:.7rem .875rem;
    font-family:inherit; font-size:.875rem; color:#0f172a;
    transition:all 150ms ease; outline:none; box-sizing:border-box;
  }
  .ap-input:focus { border-color:#4f46e5; background:#fff; box-shadow:0 0 0 3px rgba(79,70,229,.12); }
  .ap-input::placeholder { color:#94a3b8; }

  .ap-btn {
    width:100%; display:flex; align-items:center; justify-content:center; gap:.5rem;
    padding:.75rem 1.25rem;
    background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);
    color:#fff; border:none; border-radius:10px;
    font-family:inherit; font-size:.9375rem; font-weight:700;
    cursor:pointer; transition:all 180ms ease;
    box-shadow:0 4px 14px rgba(79,70,229,.28);
  }
  .ap-btn:hover:not(:disabled) { background:linear-gradient(135deg,#4338ca 0%,#4f46e5 100%); box-shadow:0 6px 20px rgba(79,70,229,.38); transform:translateY(-1px); }
  .ap-btn:disabled { opacity:.6; cursor:not-allowed; }

  .ap-btn-outline {
    width:100%; display:flex; align-items:center; justify-content:center; gap:.5rem;
    padding:.7rem 1.25rem; background:#fff; color:#374151;
    border:1.5px solid #e2e8f0; border-radius:10px;
    font-family:inherit; font-size:.875rem; font-weight:600;
    cursor:pointer; transition:all 150ms ease;
    box-shadow:0 1px 3px rgba(15,23,42,.05);
  }
  .ap-btn-outline:hover { border-color:#4f46e5; box-shadow:0 4px 12px rgba(79,70,229,.12); transform:translateY(-1px); }

  .ap-link { background:none;border:none;color:#4f46e5;font-weight:600;cursor:pointer;padding:0;font-size:inherit;font-family:inherit; }
  .ap-link:hover { text-decoration:underline; }

  .ap-spin {
    width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);
    border-top-color:#fff;border-radius:50%;
    animation:spin .7s linear infinite;display:inline-block;flex-shrink:0;
  }
  .ap-spin-dark {
    width:18px;height:18px;border:2.5px solid rgba(79,70,229,.2);
    border-top-color:#4f46e5;border-radius:50%;
    animation:spin .7s linear infinite;display:inline-block;flex-shrink:0;
  }

  .ap-label { display:block; font-size:.75rem; font-weight:700; color:#374151; margin-bottom:.4rem; }

  .ap-divider { display:flex; align-items:center; gap:.75rem; margin:1.25rem 0; }
  .ap-divider-line { flex:1; height:1px; background:#e2e8f0; }
  .ap-divider-text { font-size:.6875rem; font-weight:700; color:#94a3b8; letter-spacing:.06em; text-transform:uppercase; }

  /* Toast */
  .ap-toast {
    position:fixed; top:1.25rem; right:1.25rem; z-index:9999;
    display:flex; align-items:flex-start; gap:.75rem;
    padding:.875rem 1.125rem; background:#fff; border-radius:14px;
    box-shadow:0 10px 30px -5px rgba(15,23,42,.15); max-width:380px;
    animation:toastIn .25s cubic-bezier(.16,1,.3,1);
    font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  }

  /* Modal overlay */
  .ap-overlay {
    position:fixed; inset:0; background:rgba(15,23,42,.5);
    backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center;
    z-index:4000; padding:1rem; animation:fadeIn .2s ease;
  }
  .ap-modal {
    background:#fff; border-radius:20px; width:100%; max-width:460px;
    box-shadow:0 25px 60px -10px rgba(15,23,42,.2),0 0 0 1px rgba(15,23,42,.06);
    overflow:hidden; animation:fadeUp .3s cubic-bezier(.16,1,.3,1);
  }
`;

/* ─── Google SVG ─── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

/* ─── Eye icon ─── */
const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

/* ─── Admin credentials (hardcoded — swap with your API later) ─── */
const ADMIN_EMAIL    = 'marcus.admin@stocksense.io';
const ADMIN_PASSWORD = 'admin123';

/* ═══════════════════════════════════════════════
   MAIN AUTH PAGE
═══════════════════════════════════════════════ */
export const AuthPage = ({ onLoginSuccess }) => {
  const { loginUserSession } = useAuth();
  const { users, addUser, approveUser, addNotification, recordSystemActivity } = useInventory();

  const [mode, setMode]       = useState('login');  // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  /* ── Login fields ── */
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  /* ── Register fields ── */
  const [rName,  setRName]  = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPwd,   setRPwd]   = useState('');
  const [rPwd2,  setRPwd2]  = useState('');
  const [showRP, setShowRP] = useState(false);

  /* ── Pending approval modal ── */
  const [pendingUser,      setPendingUser]      = useState(null);
  const [checkingStatus,   setCheckingStatus]   = useState(false);
  const [approvalFeedback, setApprovalFeedback] = useState(null);

  /* ── Helpers ── */
  const toast$ = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };
  const toastBorder = { success:'#a7f3d0', error:'#fecdd3', warning:'#fde68a', info:'#c7d2fe' };
  const toastIcon   = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };

  const doSession = useCallback((userObj) => {
    if (loginUserSession) loginUserSession(userObj);
    if (onLoginSuccess)   setTimeout(() => onLoginSuccess(userObj), 300);
  }, [loginUserSession, onLoginSuccess]);

  /* ════════════════════════════════════════════
     LOGIN
  ════════════════════════════════════════════ */
  const handleLogin = async (e) => {
    e.preventDefault();
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password) { toast$('Please enter your email and password.', 'error'); return; }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimEmail, password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast$('Invalid email or password.', 'error');
        } else {
          toast$('An error occurred while logging in.', 'error');
        }
        setLoading(false);
        return;
      }

      const userData = await response.json();
      
      const sessionUser = {
        id: `op-${userData.id}`,
        name: userData.name,
        email: userData.email,
        role: userData.role === 'ADMIN' ? ROLES.ADMIN : userData.role === 'MANAGER' ? ROLES.INVENTORY_MANAGER : ROLES.WAREHOUSE_STAFF,
        status: userData.status,
        avatar: userData.name.substring(0, 2).toUpperCase(),
        facility: userData.role === 'ADMIN' ? 'Global Operations HQ' : 'WH-01 Main DC (San Francisco)'
      };
      
      toast$(`Welcome back, ${sessionUser.name}!`, 'success');
      setLoading(false);
      doSession(sessionUser);
    } catch (error) {
      console.error(error);
      toast$('Network error. Make sure the backend is running.', 'error');
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════════
     REGISTER
  ════════════════════════════════════════════ */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!rName.trim() || !rEmail.trim() || !rPwd) { toast$('Please fill in all fields.', 'error'); return; }
    if (rPwd.length < 6) { toast$('Password must be at least 6 characters.', 'warning'); return; }
    if (rPwd !== rPwd2)  { toast$('Passwords do not match.', 'error'); return; }

    const trimEmail = rEmail.trim().toLowerCase();

    // Block duplicate email
    if ((users || []).some(u => u.email?.toLowerCase() === trimEmail)) {
      toast$('An account with this email already exists. Please sign in.', 'warning');
      setEmail(rEmail.trim()); setMode('login'); return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    /* ── Add user with PENDING_APPROVAL status ── */
    const newUser = addUser({
      name: rName.trim(), email: trimEmail,
      role: ROLES.WAREHOUSE_STAFF,   // default; admin will assign proper role
      facility: 'Unassigned',
      status: 'PENDING_APPROVAL',
      notes: `Registered ${new Date().toLocaleDateString()}. Awaiting admin role assignment.`,
      phone: '',
    });

    /* ── Notify admin ── */
    addNotification({
      type: 'NEW_REGISTRATION',
      title: `📋 New User Registration: ${rName.trim()}`,
      message: `${rName.trim()} (${trimEmail}) has registered and is waiting for role assignment and approval.`,
      urgency: 'HIGH', timestamp: 'Just now', targetRole: ROLES.ADMIN,
      userId: newUser?.id, userEmail: trimEmail,
    });

    recordSystemActivity('Auth Portal', 'USER_REGISTERED', `${rName.trim()} registered — pending admin approval.`, 'INFO');

    toast$('🎉 Account created! Waiting for admin approval. Please sign in once approved.', 'success');
    setEmail(rEmail.trim());
    setRName(''); setREmail(''); setRPwd(''); setRPwd2('');
    setLoading(false);
    setTimeout(() => setMode('login'), 800);
  };

  /* ════════════════════════════════════════════
     PENDING APPROVAL ACTIONS
  ════════════════════════════════════════════ */
  const checkApproval = async () => {
    if (!pendingUser) return;
    setCheckingStatus(true);
    setApprovalFeedback(null);
    await new Promise(r => setTimeout(r, 700));

    const fresh = (users || []).find(u => u.id === pendingUser.id);
    if (fresh?.status === 'ACTIVE') {
      setApprovalFeedback({ type: 'success', msg: '✓ Approved! Logging you in…' });
      setTimeout(() => { setPendingUser(null); doSession(fresh); }, 1200);
    } else {
      setApprovalFeedback({ type: 'pending', msg: 'Still awaiting admin approval. Check back soon.' });
    }
    setCheckingStatus(false);
  };

  /* ════════════════════════════════════════════
     GOOGLE SIGN-IN
  ════════════════════════════════════════════ */
  const handleGoogleLogin = useCallback(() => {
    const gsi = window?.google?.accounts?.id;
    if (!gsi) {
      toast$('Google Sign-In is not available. Check your internet connection.', 'error');
      return;
    }

    gsi.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (!response?.credential) {
          toast$('Google sign-in was cancelled or failed.', 'warning');
          return;
        }

        const payload = decodeJwt(response.credential);
        if (!payload?.email) {
          toast$('Could not read Google account info. Please try again.', 'error');
          return;
        }

        const googleEmail = payload.email.toLowerCase();
        const googleName  = payload.name || payload.email.split('@')[0];

        setLoading(true);
        await new Promise(r => setTimeout(r, 400));

        /* 1. Admin bypass */
        if (googleEmail === ADMIN_EMAIL.toLowerCase()) {
          const adminUser = (users || []).find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || {
            id: 'op-03', name: 'Marcus Vance', email: ADMIN_EMAIL,
            role: ROLES.ADMIN, title: 'Warehouse Systems Administrator',
            facility: 'Global Operations HQ', avatar: 'MV', status: 'ACTIVE',
          };
          toast$(`Welcome, Admin! (${googleName})`, 'success');
          setLoading(false);
          doSession(adminUser);
          return;
        }

        /* 2. Existing user */
        const found = (users || []).find(u => u.email?.toLowerCase() === googleEmail);
        if (found) {
          if (found.status === 'PENDING_APPROVAL') {
            addNotification({
              type: 'APPROVAL_REQUEST',
              title: `⏳ Google Login Attempt: ${found.name}`,
              message: `${found.name} tried to sign in via Google — still pending approval.`,
              urgency: 'HIGH', timestamp: 'Just now', targetRole: ROLES.ADMIN,
              userId: found.id, userRole: found.role,
            });
            setLoading(false);
            setPendingUser(found);
            setApprovalFeedback(null);
            return;
          }
          if (found.status === 'SUSPENDED') {
            setLoading(false);
            toast$('Your account is suspended. Contact your administrator.', 'error');
            return;
          }
          /* Active — log in */
          toast$(`Welcome, ${found.name}! (Google)`, 'success');
          setLoading(false);
          doSession({ ...found, lastActive: 'Just now' });
          return;
        }

        /* 3. New user — auto-register as PENDING */
        const newUser = addUser({
          name: googleName, email: googleEmail,
          role: ROLES.WAREHOUSE_STAFF,
          facility: 'Unassigned', status: 'PENDING_APPROVAL',
          notes: `Google Sign-In registration on ${new Date().toLocaleDateString()}.`,
          phone: '',
        });
        addNotification({
          type: 'NEW_REGISTRATION',
          title: `📋 Google Sign-Up: ${googleName}`,
          message: `${googleName} (${googleEmail}) signed up via Google — needs role assignment.`,
          urgency: 'HIGH', timestamp: 'Just now', targetRole: ROLES.ADMIN,
          userId: newUser?.id, userEmail: googleEmail,
        });
        recordSystemActivity('Auth Portal', 'GOOGLE_REGISTERED', `${googleName} registered via Google OAuth.`, 'INFO');
        toast$('🎉 Google account registered! Awaiting admin approval.', 'success');
        setLoading(false);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    gsi.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        /* Fallback: render a one-tap button in a temp div */
        const tmp = document.createElement('div');
        tmp.id = '__gsi_tmp';
        tmp.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
        document.body.appendChild(tmp);
        window.google.accounts.id.renderButton(tmp, {
          theme: 'outline', size: 'large', type: 'standard',
        });
        tmp.querySelector('div[role=button]')?.click();
        setTimeout(() => document.body.removeChild(tmp), 2000);
      }
    });
  }, [users, addUser, addNotification, recordSystemActivity, doSession]);

  /* ─── Render ─── */
  return (
    <>
      <style>{STYLE}</style>

      <div className="ap-wrap">

        {/* ══ LEFT BRAND PANEL ══ */}
        <div className="ap-brand">
          <div className="ap-orb" style={{ width:380,height:380,background:'rgba(255,255,255,.07)',top:'-100px',right:'-80px' }}/>
          <div className="ap-orb" style={{ width:240,height:240,background:'rgba(255,255,255,.05)',bottom:'-50px',left:'-40px' }}/>

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2.5rem' }}>
              <div style={{ width:50,height:50,borderRadius:14,background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem' }}>📦</div>
              <div>
                <div style={{ fontSize:'1.75rem',fontWeight:900,color:'#fff',letterSpacing:'-0.03em',lineHeight:1 }}>StockSense</div>
                <div style={{ fontSize:'.6875rem',fontWeight:700,color:'rgba(255,255,255,.7)',letterSpacing:'.08em',textTransform:'uppercase' }}>Enterprise WMS</div>
              </div>
            </div>

            <h1 style={{ fontSize:'2.25rem',fontWeight:900,color:'#fff',lineHeight:1.15,letterSpacing:'-0.03em',marginBottom:'1rem' }}>
              Warehouse Operations,<br/>Reimagined.
            </h1>
            <p style={{ fontSize:'1rem',color:'rgba(255,255,255,.75)',lineHeight:1.6,marginBottom:'3rem',maxWidth:370 }}>
              Real-time inventory control, role-based access, and intelligent warehouse management — all in one platform.
            </p>

            {[
              { icon:'🏭', title:'Multi-Warehouse Control',   desc:'Manage multiple facilities from a unified dashboard' },
              { icon:'🔐', title:'Role-Based Access Control', desc:'Admin, Manager, and Staff with granular permissions' },
              { icon:'📊', title:'Real-Time Analytics',       desc:'Live stock levels, movements, and performance KPIs' },
              { icon:'🔄', title:'Smart Operations Hub',      desc:'Receipts, transfers, deliveries, and adjustments' },
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'.875rem', marginBottom:'1.25rem' }}>
                <div style={{ width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.125rem',flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight:700,color:'#fff',fontSize:'.9375rem',marginBottom:2 }}>{f.title}</div>
                  <div style={{ fontSize:'.8125rem',color:'rgba(255,255,255,.65)',lineHeight:1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT FORM PANEL ══ */}
        <div className="ap-right">

          {/* Brand mark */}
          <div style={{ width:'100%',maxWidth:470,marginBottom:'1.75rem',display:'flex',alignItems:'center',gap:'.625rem' }}>
            <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#4f46e5,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',boxShadow:'0 4px 12px rgba(79,70,229,.35)' }}>📦</div>
            <div>
              <span style={{ fontSize:'1.25rem',fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em' }}>Stock</span>
              <span style={{ fontSize:'1.25rem',fontWeight:900,color:'#4f46e5',letterSpacing:'-0.03em' }}>Sense</span>
              <span style={{ marginLeft:'.5rem',fontSize:'.625rem',fontWeight:800,background:'#eef2ff',color:'#4f46e5',border:'1px solid #c7d2fe',padding:'.15rem .5rem',borderRadius:999,letterSpacing:'.05em' }}>ENTERPRISE WMS</span>
            </div>
          </div>

          {/* ── Auth Card ── */}
          <div className="ap-card">

            {/* Tabs */}
            <div className="ap-tabs">
              <button className={`ap-tab ${mode === 'login' ? 'on' : ''}`} onClick={() => setMode('login')}>🔐 Sign In</button>
              <button className={`ap-tab ${mode === 'register' ? 'on' : ''}`} onClick={() => setMode('register')}>✍️ Register</button>
            </div>

            <div className="ap-body">

              {/* Heading */}
              <div style={{ marginBottom:'1rem' }}>
                <h2 style={{ fontSize:'1.25rem',fontWeight:800,color:'#0f172a',letterSpacing:'-0.02em',marginBottom:'.2rem' }}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p style={{ fontSize:'.8125rem',color:'#64748b' }}>
                  {mode === 'login'
                    ? 'Sign in to access your StockSense workspace.'
                    : 'Register — admin will approve and assign your role.'}
                </p>
              </div>



              {/* ════════ LOGIN FORM ════════ */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
                  <div>
                    <label className="ap-label">Email Address</label>
                    <div style={{ position:'relative' }}>
                      <span style={{ position:'absolute',left:'.85rem',top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:'.9rem' }}>✉️</span>
                      <input type="email" className="ap-input" placeholder="you@company.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        style={{ paddingLeft:'2.4rem' }} required/>
                    </div>
                  </div>

                  <div>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem' }}>
                      <label className="ap-label" style={{ margin:0 }}>Password</label>
                    </div>
                    <div style={{ position:'relative' }}>
                      <span style={{ position:'absolute',left:'.85rem',top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:'.9rem' }}>🔒</span>
                      <input type={showPwd ? 'text' : 'password'} className="ap-input" placeholder="Enter your password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        style={{ paddingLeft:'2.4rem',paddingRight:'2.75rem' }} required/>
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        style={{ position:'absolute',right:'.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:0,display:'flex' }}>
                        <EyeIcon open={showPwd}/>
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="ap-btn" style={{ marginTop:'.25rem' }}>
                    {loading ? <><span className="ap-spin"/><span>Signing in…</span></> : <><span>Sign In</span><span>→</span></>}
                  </button>

                  <p style={{ textAlign:'center',fontSize:'.8125rem',color:'#64748b',margin:'.25rem 0 0' }}>
                    Don't have an account?{' '}
                    <button type="button" className="ap-link" onClick={() => setMode('register')}>Register here</button>
                  </p>

                  {/* Divider */}
                  <div className="ap-divider" style={{ margin:'.5rem 0' }}>
                    <div className="ap-divider-line"/>
                    <span className="ap-divider-text">or</span>
                    <div className="ap-divider-line"/>
                  </div>

                  {/* Google button */}
                  <button type="button" className="ap-btn-outline" onClick={handleGoogleLogin} disabled={loading}>
                    <GoogleIcon/><span>Continue with Google</span>
                  </button>

                </form>
              )}

              {/* ════════ REGISTER FORM ════════ */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} style={{ display:'flex',flexDirection:'column',gap:'.85rem' }}>

                  <div>
                    <label className="ap-label">Full Name</label>
                    <div style={{ position:'relative' }}>
                      <span style={{ position:'absolute',left:'.85rem',top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:'.9rem' }}>👤</span>
                      <input type="text" className="ap-input" placeholder="e.g. Alex Rivera"
                        value={rName} onChange={e => setRName(e.target.value)}
                        style={{ paddingLeft:'2.4rem' }} required/>
                    </div>
                  </div>

                  <div>
                    <label className="ap-label">Email Address</label>
                    <div style={{ position:'relative' }}>
                      <span style={{ position:'absolute',left:'.85rem',top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:'.9rem' }}>✉️</span>
                      <input type="email" className="ap-input" placeholder="you@company.com"
                        value={rEmail} onChange={e => setREmail(e.target.value)}
                        style={{ paddingLeft:'2.4rem' }} required/>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.625rem' }}>
                    <div>
                      <label className="ap-label">Password</label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute',left:'.75rem',top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:'.85rem' }}>🔒</span>
                        <input type={showRP ? 'text' : 'password'} className="ap-input" placeholder="Min 6 chars"
                          value={rPwd} onChange={e => setRPwd(e.target.value)}
                          style={{ paddingLeft:'2.1rem',paddingRight:'2.25rem' }} required/>
                        <button type="button" onClick={() => setShowRP(!showRP)}
                          style={{ position:'absolute',right:'.55rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:0,display:'flex' }}>
                          <EyeIcon open={showRP}/>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="ap-label">Confirm Password</label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute',left:'.75rem',top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:'.85rem' }}>🛡️</span>
                        <input type={showRP ? 'text' : 'password'} className="ap-input" placeholder="Repeat"
                          value={rPwd2} onChange={e => setRPwd2(e.target.value)}
                          style={{ paddingLeft:'2.1rem' }} required/>
                      </div>
                    </div>
                  </div>

                  {/* Sleek notice banner */}
                  <div style={{ display:'flex',alignItems:'center',gap:'.6rem',background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:10,padding:'.6rem .85rem',fontSize:'.75rem',color:'#0369a1',lineHeight:1.35 }}>
                    <span style={{ fontSize:'1rem',flexShrink:0 }}>🛡️</span>
                    <span>Admin reviews and assigns your role (Manager/Staff) upon registration.</span>
                  </div>

                  <button type="submit" disabled={loading} className="ap-btn" style={{ marginTop:'.2rem' }}>
                    {loading ? <><span className="ap-spin"/><span>Creating Account…</span></> : <><span>Create Account</span><span>→</span></>}
                  </button>

                  <p style={{ textAlign:'center',fontSize:'.8125rem',color:'#64748b',margin:'.25rem 0 0' }}>
                    Already have an account?{' '}
                    <button type="button" className="ap-link" onClick={() => setMode('login')}>Sign in here</button>
                  </p>

                </form>
              )}
            </div>
          </div>

          <p style={{ marginTop:'1.5rem',fontSize:'.75rem',color:'#94a3b8',textAlign:'center' }}>
            StockSense Enterprise WMS · Role-Based Access · Admin Approved
          </p>
        </div>
      </div>

      {/* ══ TOAST ══ */}
      {toast && (
        <div className="ap-toast" style={{ border:`1.5px solid ${toastBorder[toast.type]||'#c7d2fe'}` }}>
          <span style={{ fontSize:'1.1rem',flexShrink:0,marginTop:1 }}>{toastIcon[toast.type]||'ℹ️'}</span>
          <div style={{ flex:1,fontSize:'.8125rem',fontWeight:700,color:'#0f172a',lineHeight:1.4 }}>{toast.msg}</div>
          <button onClick={() => setToast(null)} style={{ background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'1rem',padding:0,flexShrink:0 }}>✕</button>
        </div>
      )}

      {/* ══ PENDING APPROVAL MODAL ══ */}
      {pendingUser && (
        <div className="ap-overlay" onClick={e => e.target === e.currentTarget && setPendingUser(null)}>
          <div className="ap-modal">

            {/* Header */}
            <div style={{ padding:'1.5rem 1.5rem 1.25rem',borderBottom:'1px solid #f1f5f9',textAlign:'center',background:'linear-gradient(135deg,#fffbeb,#fef3c7)' }}>
              <div style={{ width:56,height:56,borderRadius:16,background:'#fef3c7',border:'2px solid #fde68a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.75rem',margin:'0 auto .875rem' }}>⏳</div>
              <span style={{ display:'inline-block',fontSize:'.6875rem',fontWeight:800,background:'#fffbeb',color:'#b45309',border:'1px solid #fde68a',borderRadius:99,padding:'.2rem .75rem',letterSpacing:'.05em',marginBottom:'.625rem' }}>
                PENDING APPROVAL
              </span>
              <h3 style={{ fontSize:'1.1875rem',fontWeight:800,color:'#0f172a',marginBottom:'.375rem',letterSpacing:'-0.02em' }}>Waiting for Admin Review</h3>
              <p style={{ fontSize:'.8125rem',color:'#64748b',lineHeight:1.5,padding:'0 1rem' }}>
                Your account is under review. Once approved and assigned a role, you'll be able to sign in.
              </p>
            </div>

            {/* Body */}
            <div style={{ padding:'1.25rem 1.5rem 1.5rem' }}>

              {/* User info */}
              <div style={{ background:'#f8fafc',borderRadius:12,border:'1px solid #e2e8f0',padding:'.875rem 1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.875rem' }}>
                <div style={{ width:40,height:40,borderRadius:12,background:'#fef3c7',border:'1px solid #fde68a',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'.875rem',color:'#b45309',flexShrink:0 }}>
                  {pendingUser.name?.slice(0,2).toUpperCase() || 'OP'}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:800,fontSize:'.9375rem',color:'#0f172a' }}>{pendingUser.name}</div>
                  <div style={{ fontSize:'.75rem',color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{pendingUser.email}</div>
                </div>
                <span style={{ fontSize:'.625rem',fontWeight:800,background:'#fffbeb',color:'#b45309',border:'1px solid #fde68a',borderRadius:99,padding:'.2rem .6rem',whiteSpace:'nowrap' }}>PENDING</span>
              </div>

              {/* Admin notified banner */}
              <div style={{ display:'flex',alignItems:'flex-start',gap:'.625rem',padding:'.75rem',borderRadius:10,background:'#f0f9ff',border:'1px solid #bae6fd',marginBottom:'1rem' }}>
                <span style={{ fontSize:'1rem',flexShrink:0 }}>🔔</span>
                <span style={{ fontSize:'.75rem',color:'#0369a1',lineHeight:1.5 }}>
                  <strong>Admin has been notified.</strong> Once they approve your account and assign your role, you can sign in.
                </span>
              </div>

              {/* Feedback */}
              {approvalFeedback && (
                <div style={{ padding:'.625rem .875rem',borderRadius:10,marginBottom:'.875rem',fontSize:'.8125rem',fontWeight:600,background:approvalFeedback.type==='success'?'#ecfdf5':'#fffbeb',color:approvalFeedback.type==='success'?'#047857':'#b45309',border:`1px solid ${approvalFeedback.type==='success'?'#a7f3d0':'#fde68a'}`,display:'flex',alignItems:'center',gap:'.5rem' }}>
                  <span>{approvalFeedback.type==='success'?'✓':'ℹ️'}</span>
                  <span>{approvalFeedback.msg}</span>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display:'flex',flexDirection:'column',gap:'.5rem' }}>
                <button className="ap-btn" onClick={checkApproval} disabled={checkingStatus} type="button">
                  {checkingStatus ? <><span className="ap-spin"/><span>Checking…</span></> : <><span>🔄</span><span>Check Approval Status</span></>}
                </button>
                <button type="button" onClick={() => { setPendingUser(null); setApprovalFeedback(null); }}
                  style={{ padding:'.65rem',borderRadius:10,border:'1.5px solid #e2e8f0',background:'#fff',color:'#374151',fontWeight:700,fontSize:'.875rem',cursor:'pointer',fontFamily:'inherit',transition:'all 150ms ease' }}>
                  ← Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthPage;
