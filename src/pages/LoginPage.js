import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your AuctionsBD account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email Address" type="email" placeholder="you@example.com"
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} error={errors.email} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter',sans-serif", fontSize: 12.5, fontWeight: 600, color: 'rgba(30,25,20,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>Password</span>
            <Link to="/forgot-password" style={{ color: '#9a6f2a', fontSize: 12, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>Forgot password?</Link>
          </label>
          <input style={IS(errors.password)} type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          {errors.password && <span style={ES}>{errors.password}</span>}
        </div>
        <PrimaryBtn loading={loading} label="Sign In" loadingLabel="Signing in…" />
      </form>
      <p style={{ textAlign: 'center', fontFamily: "'Inter',sans-serif", fontSize: 13.5, color: 'rgba(30,25,20,0.42)', marginTop: 24 }}>
        Don't have an account? <Link to="/register" style={{ color: '#9a6f2a', fontWeight: 600 }}>Create one</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;

// ─── Shared components ───────────────────────────────────────

function Field({ label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="app-label">{label}</label>
      <input className="app-input" style={error ? { borderColor: 'var(--danger)' } : undefined} type={type} placeholder={placeholder} value={value} onChange={onChange} />
      {error && <span style={ES}>{error}</span>}
    </div>
  );
}

function PrimaryBtn({ loading, label, loadingLabel, style = {} }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '13px 20px', marginTop: 8,
      fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: '#fff', background: 'linear-gradient(145deg, #2a2218, #1a150e)',
      border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.75 : 1,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 14px rgba(0,0,0,0.16)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ...style,
    }}>
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg,rgba(255,255,255,0.1),transparent)', pointerEvents: 'none' }} />
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
          {loadingLabel}
        </span>
      ) : label}
    </button>
  );
}

// Input style
const IS = (error) => ({
  width: '100%', minHeight: 44, padding: '0 13px', boxSizing: 'border-box',
  color: '#fff', background: '#121213',
  border: `1px solid ${error ? 'var(--danger)' : 'rgba(255,255,255,0.16)'}`,
  borderRadius: 8, outline: 'none',
});
// Error style
const ES = { fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#c53030', marginTop: 2 };

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="app-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
            <div className="brand-copy"><strong>AuctionsBD</strong><small>Live Online Auctions</small></div>
          </Link>
          <h1 className="app-title" style={{ marginBottom: 8 }}>{title}</h1>
          <p className="app-muted">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="app-card app-card-pad">
          {children}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.04)} }
      `}</style>
    </div>
  );
}
