// ─── ForgotPassword.js ────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { AuthLayout } from './LoginPage';

export default function ForgotPassword() {
  const navigate              = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    let secs = 60;
    setCooldown(secs);
    const iv = setInterval(() => { secs -= 1; setCooldown(secs); if (secs <= 0) clearInterval(iv); }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return; }
    setError(''); setLoading(true);
    try {
      await authAPI.sendResetOtp({ email });
      toast.success('OTP sent! Check your inbox.');
      setSent(true); startCooldown();
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      await authAPI.sendResetOtp({ email });
      toast.success('New OTP sent!');
      startCooldown();
    } catch (err) { toast.error(err.message || 'Failed to resend.'); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title={sent ? 'Check your inbox' : 'Forgot password'} subtitle={sent ? 'Enter the OTP we sent to your email' : "Enter your email and we'll send a 6-digit OTP"}>
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={iconCircle('rgba(184,136,46,0.1)', 'rgba(184,136,46,0.25)', 'pulse')}>
            <span style={{ fontSize: 38 }}>📬</span>
          </div>
          <p style={bodyText}>We sent a 6-digit OTP to</p>
          <p style={{ color: '#b8882e', fontWeight: 700, fontSize: 15, marginBottom: 24, fontFamily: "'Inter',sans-serif", wordBreak: 'break-all' }}>{email}</p>

          <div style={stepsCard}>
            {[['1','Open the email from AuctionsBD'],['2','Copy the 6-digit OTP code'],['3','Enter the code and set a new password']].map(([n, text], i, arr) => (
              <div key={n} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(180,140,60,0.12)' : 'none' }}>
                <span style={stepDot}>{n}</span>
                <span style={{ fontSize: 13.5, color: 'rgba(30,25,20,0.58)', paddingTop: 3, fontFamily: "'Inter',sans-serif" }}>{text}</span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/verify-reset-otp', { state: { email }, replace: true })} style={{ ...darkBtn, width: '100%', padding: '13px', marginBottom: 12 }}>
            <span style={btnGloss} />Enter OTP →
          </button>
          <p style={{ fontSize: 13, color: 'rgba(30,25,20,0.4)', marginBottom: 10, fontFamily: "'Inter',sans-serif" }}>Didn't receive it? Check spam, or:</p>
          <button onClick={handleResend} disabled={loading || cooldown > 0} style={{ ...ghostBtn, width: '100%', padding: '11px', marginBottom: 16 }}>
            {loading ? 'Sending…' : cooldown > 0 ? `Resend available in ${cooldown}s` : '↺ Resend OTP'}
          </button>
          <div style={divider} />
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 14 }}>
            <Link to="/login" style={mutedLink}>← Back to Login</Link>
            <span style={{ color: 'rgba(180,140,60,0.3)' }}>|</span>
            <Link to="/register" style={mutedLink}>Create account</Link>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(30,25,20,0.3)', marginTop: 18, fontFamily: "'Inter',sans-serif" }}>The OTP expires in 10 minutes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={LS}>Email Address</label>
            <input style={IS(error)} type="email" placeholder="you@example.com" value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }} autoFocus />
            {error && <span style={ES}>{error}</span>}
          </div>
          <div style={{ padding: '11px 14px', background: 'rgba(184,136,46,0.06)', border: '1px solid rgba(184,136,46,0.2)', borderRadius: 8, fontSize: 13, color: 'rgba(30,25,20,0.55)', lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
            🔒 We'll send a 6-digit OTP. It expires in <strong style={{ color: '#9a6f2a' }}>10 minutes</strong>.
          </div>
          <button type="submit" disabled={loading} style={{ ...darkBtn, width: '100%', padding: '13px', marginTop: 4 }}>
            <span style={btnGloss} />
            {loading ? <Spinner label="Sending OTP…" /> : 'Send OTP →'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'rgba(30,25,20,0.42)', fontFamily: "'Inter',sans-serif" }}>
            Remember your password? <Link to="/login" style={{ color: '#9a6f2a', fontWeight: 600 }}>Sign in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

// ─── Shared mini-components & styles ──────────────────────────

const LS = { fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: 'rgba(30,25,20,0.48)', textTransform: 'uppercase', letterSpacing: '0.08em' };
const IS = (err) => ({ width: '100%', padding: '11px 14px', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#1a150e', background: 'linear-gradient(145deg,rgba(255,255,255,0.97),rgba(250,246,236,0.88))', border: `1px solid ${err ? '#e05555' : 'rgba(180,140,60,0.22)'}`, borderRadius: 8, outline: 'none', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset', transition: 'border-color 0.2s' });
const ES = { fontFamily: "'Inter',sans-serif", fontSize: 12, color: '#c53030' };
const darkBtn = { background: 'linear-gradient(145deg,#2a2218,#1a150e)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 14px rgba(0,0,0,0.16)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'block' };
const ghostBtn = { background: 'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(248,244,234,0.7))', color: 'rgba(30,25,20,0.6)', border: '1px solid rgba(180,140,60,0.2)', borderRadius: 8, cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 500, boxShadow: '0 1px 0 rgba(255,255,255,1) inset', transition: 'all 0.2s' };
const btnGloss = { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg,rgba(255,255,255,0.1),transparent)', pointerEvents: 'none' };
const mutedLink = { fontSize: 13.5, color: 'rgba(30,25,20,0.4)', textDecoration: 'none', fontFamily: "'Inter',sans-serif", transition: 'color 0.2s' };
const divider = { height: 1, background: 'linear-gradient(90deg,transparent,rgba(180,140,60,0.18),transparent)', margin: '8px 0' };
const bodyText = { fontFamily: "'Inter',sans-serif", color: 'rgba(30,25,20,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 6 };
const stepsCard = { background: 'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(250,246,234,0.8))', border: '1px solid rgba(180,140,60,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, textAlign: 'left', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset' };
const stepDot = { width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: 'rgba(184,136,46,0.1)', border: '1px solid rgba(184,136,46,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#9a6f2a', fontFamily: "'Inter',sans-serif" };
const iconCircle = (bg, border, anim) => ({ width: 80, height: 80, borderRadius: '50%', background: bg, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: `${anim} 2.5s ease-in-out infinite` });

function Spinner({ label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
      {label}
    </span>
  );
}