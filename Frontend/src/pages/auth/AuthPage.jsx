import React, { useState } from 'react';

/* ─── Injected CSS (no Tailwind, pure StockSense theme) ─── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes toastIn  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }

  .ap-wrap {
    min-height:100vh; display:flex;
    font-family:'Plus Jakarta Sans',system-ui,sans-serif;
    background:#f8fafc;
  }
  /* ── Left brand panel (hidden on mobile) ── */
  .ap-brand {
    display:none; width:44%; min-height:100vh;
    background:linear-gradient(145deg,#4f46e5 0%,#6366f1 55%,#818cf8 100%);
    position:relative; overflow:hidden;
    flex-direction:column; justify-content:center; padding:3rem 3.5rem;
  }
  @media(min-width:900px){ .ap-brand{display:flex} }
  .ap-orb{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none}

  /* ── Right form area ── */
  .ap-right {
    flex:1; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:2.5rem 1rem; overflow-y:auto;
  }
  /* ── Card ── */
  .ap-card {
    width:100%; max-width:440px; background:#fff;
    border-radius:20px; border:1px solid #e2e8f0;
    box-shadow:0 8px 32px -8px rgba(15,23,42,.12),0 0 0 1px rgba(15,23,42,.04);
    overflow:hidden;
    animation:fadeUp .35s cubic-bezier(.16,1,.3,1) both;
  }
  /* ── Tab row ── */
  .ap-tabs { display:flex; gap:4px; padding:6px; background:#f1f5f9; border-bottom:1px solid #e2e8f0; }
  .ap-tab {
    flex:1; padding:.55rem .75rem; border:none; background:transparent;
    font-family:inherit; font-size:.8125rem; font-weight:700;
    cursor:pointer; transition:all 150ms ease; border-radius:8px; color:#64748b;
  }
  .ap-tab.on { background:#fff; color:#4f46e5; box-shadow:0 1px 4px rgba(15,23,42,.12); }
  .ap-tab:not(.on):hover { color:#0f172a; background:rgba(255,255,255,.5); }

  /* ── Form body ── */
  .ap-body { padding:1.75rem; }

  /* ── Inputs ── */
  .ap-input {
    width:100%; background:#f8fafc; border:1.5px solid #e2e8f0;
    border-radius:10px; padding:.7rem .875rem;
    font-family:inherit; font-size:.875rem; color:#0f172a;
    transition:all 150ms ease; outline:none; box-sizing:border-box;
  }
  .ap-input:focus { border-color:#4f46e5; background:#fff; box-shadow:0 0 0 3px rgba(79,70,229,.12); }
  .ap-input::placeholder { color:#94a3b8; }

  /* ── Primary button ── */
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

  /* ── Google button ── */
  .ap-google {
    width:100%; display:flex; align-items:center; justify-content:center; gap:.625rem;
    padding:.7rem 1.25rem; background:#fff; color:#0f172a;
    border:1.5px solid #e2e8f0; border-radius:10px;
    font-family:inherit; font-size:.875rem; font-weight:600;
    cursor:pointer; transition:all 150ms ease;
    box-shadow:0 1px 3px rgba(15,23,42,.05);
  }
  .ap-google:hover { border-color:#4f46e5; box-shadow:0 4px 12px rgba(79,70,229,.12); transform:translateY(-1px); }

  /* ── Link button ── */
  .ap-link { background:none;border:none;color:#4f46e5;font-weight:600;cursor:pointer;padding:0;font-size:inherit;font-family:inherit; }
  .ap-link:hover { text-decoration:underline; }

  /* ── Role cards ── */
  .ap-role {
    padding:.7rem 1rem; border-radius:10px;
    border:1.5px solid #e2e8f0; background:#f8fafc;
    cursor:pointer; transition:all 150ms ease; text-align:left;
    font-family:inherit;
  }
  .ap-role:hover { border-color:#4f46e5; background:#eef2ff; }
  .ap-role.staff  { border-color:#10b981; background:#ecfdf5; }
  .ap-role.mgr    { border-color:#4f46e5; background:#eef2ff; }

  /* ── Spinner ── */
  .ap-spin {
    width:18px; height:18px; border:2.5px solid rgba(255,255,255,.3);
    border-top-color:#fff; border-radius:50%;
    animation:spin .7s linear infinite; display:inline-block; flex-shrink:0;
  }

  /* ── Toast ── */
  .ap-toast {
    position:fixed; top:1.25rem; right:1.25rem; z-index:9999;
    display:flex; align-items:flex-start; gap:.75rem;
    padding:.875rem 1.125rem; background:#fff; border-radius:14px;
    box-shadow:0 10px 30px -5px rgba(15,23,42,.15); max-width:380px;
    animation:toastIn .25s cubic-bezier(.16,1,.3,1);
    font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  }

  /* ── Field label ── */
  .ap-label { display:block; font-size:.75rem; font-weight:700; color:#374151; margin-bottom:.4rem; }

  /* ── Divider ── */
  .ap-divider { display:flex; align-items:center; gap:.75rem; margin:1.25rem 0; }
  .ap-divider-line { flex:1; height:1px; background:#e2e8f0; }
  .ap-divider-text { font-size:.6875rem; font-weight:700; color:#94a3b8; letter-spacing:.06em; text-transform:uppercase; }
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
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export const AuthPage = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  /* ── Login state ── */
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(true);

  /* ── Register state ── */
  const [rName,    setRName]    = useState('');
  const [rEmail,   setREmail]   = useState('');
  const [rPwd,     setRPwd]     = useState('');
  const [rPwd2,    setRPwd2]    = useState('');
  const [showRPwd, setShowRPwd] = useState(false);
  const [role,     setRole]     = useState('WAREHOUSE_STAFF');

  /* ── Helpers ── */
  const toast$ = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const toastBorder = {
    success: '#a7f3d0', error: '#fecdd3', warning: '#fde68a', info: '#c7d2fe',
  };
  const toastIcon = {
    success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
  };

  /* ──────────────────────────────────────────────────────────
     LOGIN  →  plug your API here
  ────────────────────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast$('Please fill in email and password.', 'error');
      return;
    }
    setLoading(true);
    try {
      /* ── API CALL (replace with your endpoint) ──────────────
         const res = await fetch('/api/auth/login', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email: email.trim(), password }),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.message || 'Login failed');
         // save token:  localStorage.setItem('token', data.token);
         if (onLoginSuccess) onLoginSuccess(data.user);
      ───────────────────────────────────────────────────────── */

      // ── DEMO (remove when API is ready) ──
      await new Promise(r => setTimeout(r, 900));
      toast$(`Welcome back! Logging in…`, 'success');
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess({ email }); }, 600);

    } catch (err) {
      toast$(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
     REGISTER  →  plug your API here
  ────────────────────────────────────────────────────────── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!rName.trim() || !rEmail.trim() || !rPwd) {
      toast$('Please fill in all required fields.', 'error');
      return;
    }
    if (rPwd.length < 6) {
      toast$('Password must be at least 6 characters.', 'warning');
      return;
    }
    if (rPwd !== rPwd2) {
      toast$('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      /* ── API CALL (replace with your endpoint) ──────────────
         const res = await fetch('/api/auth/register', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ name: rName.trim(), email: rEmail.trim(), password: rPwd, role }),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.message || 'Registration failed');
      ───────────────────────────────────────────────────────── */

      // ── DEMO (remove when API is ready) ──
      await new Promise(r => setTimeout(r, 900));
      toast$('🎉 Account created successfully! Please sign in.', 'success');
      setEmail(rEmail.trim());
      setRName(''); setREmail(''); setRPwd(''); setRPwd2('');
      setTimeout(() => setMode('login'), 600);

    } catch (err) {
      toast$(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
     GOOGLE AUTH  →  plug Firebase / Google Client here
  ────────────────────────────────────────────────────────── */
  const handleGoogle = async () => {
    try {
      /* ── Firebase example ────────────────────────────────────
         import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
         const provider = new GoogleAuthProvider();
         const result   = await signInWithPopup(getAuth(), provider);
         if (onLoginSuccess) onLoginSuccess(result.user);
      ───────────────────────────────────────────────────────── */
      toast$('Google Auth: connect your Firebase / Google Client ID here.', 'info');
    } catch (err) {
      toast$('Google sign-in failed.', 'error');
    }
  };

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
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'2.5rem' }}>
              <div style={{ width:50,height:50,borderRadius:14,background:'rgba(255,255,255,.2)',border:'1px solid rgba(255,255,255,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem' }}>
                📦
              </div>
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

            {/* Feature list */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {[
                { icon:'🏭', title:'Multi-Warehouse Control',    desc:'Manage multiple facilities from a unified dashboard' },
                { icon:'🔐', title:'Role-Based Access Control',  desc:'Admin, Manager, and Staff with granular permissions' },
                { icon:'📊', title:'Real-Time Analytics',        desc:'Live stock levels, movements, and performance KPIs'  },
                { icon:'🔄', title:'Smart Operations Hub',       desc:'Receipts, transfers, deliveries, and adjustments'    },
              ].map((f, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'.875rem' }}>
                  <div style={{ width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.125rem',flexShrink:0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight:700,color:'#fff',fontSize:'.9375rem',marginBottom:2 }}>{f.title}</div>
                    <div style={{ fontSize:'.8125rem',color:'rgba(255,255,255,.65)',lineHeight:1.4 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT FORM PANEL ══ */}
        <div className="ap-right">

          {/* Brand mark (mobile) */}
          <div style={{ width:'100%',maxWidth:440,marginBottom:'1.75rem',display:'flex',alignItems:'center',gap:'.625rem' }}>
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
              <button className={`ap-tab ${mode === 'login' ? 'on' : ''}`} onClick={() => setMode('login')}>
                🔐 Sign In
              </button>
              <button className={`ap-tab ${mode === 'register' ? 'on' : ''}`} onClick={() => setMode('register')}>
                ✍️ Register
              </button>
            </div>

            <div className="ap-body">

              {/* Heading */}
              <div style={{ marginBottom:'1.5rem' }}>
                <h2 style={{ fontSize:'1.375rem',fontWeight:800,color:'#0f172a',letterSpacing:'-0.02em',marginBottom:'.25rem' }}>
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p style={{ fontSize:'.8125rem',color:'#64748b' }}>
                  {mode === 'login'
                    ? 'Sign in to access your StockSense workspace.'
                    : 'Register a new account to get started.'}
                </p>
              </div>

              {/* Google button */}
              <button className="ap-google" onClick={handleGoogle}>
                <GoogleIcon/>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="ap-divider">
                <div className="ap-divider-line"/>
                <span className="ap-divider-text">or with email</span>
                <div className="ap-divider-line"/>
              </div>

              {/* ════════ LOGIN FORM ════════ */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>

                  {/* Email */}
                  <div>
                    <label className="ap-label">Email Address</label>
                    <div style={{ position:'relative' }}>
                      <span style={{ position:'absolute',left:'.75rem',top:'50%',transform:'translateY(-50%)',fontSize:'1rem',color:'#94a3b8' }}>✉️</span>
                      <input
                        type="email"
                        className="ap-input"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ paddingLeft:'2.25rem' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="ap-label">Password</label>
                    <div style={{ position:'relative' }}>
                      <span style={{ position:'absolute',left:'.75rem',top:'50%',transform:'translateY(-50%)',fontSize:'1rem',color:'#94a3b8' }}>🔒</span>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        className="ap-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ paddingLeft:'2.25rem', paddingRight:'2.75rem' }}
                        required
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        style={{ position:'absolute',right:'.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:0,display:'flex' }}>
                        <EyeIcon open={showPwd}/>
                      </button>
                    </div>
                  </div>

                  {/* Remember + Forgot */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <label style={{ display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.8125rem',color:'#475569',cursor:'pointer',userSelect:'none' }}>
                      <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor:'#4f46e5',width:15,height:15 }}/>
                      Remember me
                    </label>
                    <button type="button" className="ap-link" style={{ fontSize:'.8125rem' }}>Forgot password?</button>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading} className="ap-btn" style={{ marginTop:'.25rem' }}>
                    {loading ? <><span className="ap-spin"/><span>Signing in…</span></> : <><span>Sign In</span><span>→</span></>}
                  </button>

                  <p style={{ textAlign:'center', fontSize:'.8125rem', color:'#64748b', marginTop:'.25rem' }}>
                    Don't have an account?{' '}
                    <button type="button" className="ap-link" onClick={() => setMode('register')}>Create one</button>
                  </p>
                </form>
              )}

              {/* ════════ REGISTER FORM ════════ */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} style={{ display:'flex',flexDirection:'column',gap:'.875rem' }}>

                  {/* Full Name */}
                  <div>
                    <label className="ap-label">Full Name *</label>
                    <input type="text" className="ap-input" placeholder="e.g. Alex Rivera"
                      value={rName} onChange={e => setRName(e.target.value)} required/>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="ap-label">Email Address *</label>
                    <input type="email" className="ap-input" placeholder="you@company.com"
                      value={rEmail} onChange={e => setREmail(e.target.value)} required/>
                  </div>

                  {/* Passwords side-by-side */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                    <div>
                      <label className="ap-label">Password *</label>
                      <div style={{ position:'relative' }}>
                        <input type={showRPwd ? 'text' : 'password'} className="ap-input" placeholder="Min 6 chars"
                          value={rPwd} onChange={e => setRPwd(e.target.value)}
                          style={{ paddingRight:'2.5rem' }} required/>
                        <button type="button" onClick={() => setShowRPwd(!showRPwd)}
                          style={{ position:'absolute',right:'.65rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:0,display:'flex' }}>
                          <EyeIcon open={showRPwd}/>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="ap-label">Confirm *</label>
                      <input type={showRPwd ? 'text' : 'password'} className="ap-input" placeholder="Repeat"
                        value={rPwd2} onChange={e => setRPwd2(e.target.value)} required/>
                    </div>
                  </div>

                  {/* Role selection */}
                  <div>
                    <label className="ap-label">Select Role *</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.625rem' }}>
                      <button type="button"
                        className={`ap-role ${role === 'WAREHOUSE_STAFF' ? 'staff' : ''}`}
                        onClick={() => setRole('WAREHOUSE_STAFF')}>
                        <div style={{ fontSize:'1.1rem', marginBottom:3 }}>📦</div>
                        <div style={{ fontWeight:800, fontSize:'.8125rem', color: role === 'WAREHOUSE_STAFF' ? '#047857' : '#0f172a' }}>Warehouse Staff</div>
                        <div style={{ fontSize:'.6875rem', color:'#64748b', marginTop:2 }}>Receiving, picking, moves</div>
                      </button>
                      <button type="button"
                        className={`ap-role ${role === 'INVENTORY_MANAGER' ? 'mgr' : ''}`}
                        onClick={() => setRole('INVENTORY_MANAGER')}>
                        <div style={{ fontSize:'1.1rem', marginBottom:3 }}>📊</div>
                        <div style={{ fontWeight:800, fontSize:'.8125rem', color: role === 'INVENTORY_MANAGER' ? '#4f46e5' : '#0f172a' }}>Inv. Manager</div>
                        <div style={{ fontSize:'.6875rem', color:'#64748b', marginTop:2 }}>Catalog, reports, ledger</div>
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading} className="ap-btn" style={{ marginTop:'.25rem' }}>
                    {loading ? <><span className="ap-spin"/><span>Creating account…</span></> : <><span>Create Account</span><span>→</span></>}
                  </button>

                  <p style={{ textAlign:'center', fontSize:'.8125rem', color:'#64748b' }}>
                    Already have an account?{' '}
                    <button type="button" className="ap-link" onClick={() => setMode('login')}>Sign in</button>
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <p style={{ marginTop:'1.5rem', fontSize:'.75rem', color:'#94a3b8', textAlign:'center' }}>
            StockSense Enterprise WMS · Secure · API Ready
          </p>
        </div>
      </div>

      {/* ══ TOAST ══ */}
      {toast && (
        <div className="ap-toast" style={{ border: `1.5px solid ${toastBorder[toast.type] || '#c7d2fe'}` }}>
          <span style={{ fontSize:'1.1rem', flexShrink:0, marginTop:1 }}>{toastIcon[toast.type] || 'ℹ️'}</span>
          <div style={{ flex:1, fontSize:'.8125rem', fontWeight:700, color:'#0f172a', lineHeight:1.4 }}>{toast.msg}</div>
          <button onClick={() => setToast(null)} style={{ background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'1rem',padding:0,flexShrink:0 }}>✕</button>
        </div>
      )}
    </>
  );
};

export default AuthPage;
