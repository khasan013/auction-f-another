import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS = { loading: 'loading', success: 'success', error: 'error' };
const F  = "'Inter',sans-serif";
const GL = { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg,rgba(255,255,255,0.1),transparent)', pointerEvents: 'none' };

export default function VerifyEmailPage() {
  const { token }    = useParams();
  const { loadUser } = useAuth();
  const navigate     = useNavigate();
  const [status, setStatus]     = useState(STATUS.loading);
  const [message, setMessage]   = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await authAPI.verifyEmail(token);
        // Token stored by API interceptor, then reload user
        if (res.token) localStorage.setItem('token', res.token);
        await loadUser();
        setStatus(STATUS.success);

        // Auto-redirect after countdown
        let secs = 5;
        const interval = setInterval(() => {
          secs -= 1;
          setCountdown(secs);
          if (secs <= 0) {
            clearInterval(interval);
            navigate('/dashboard', { replace: true });
          }
        }, 1000);
        return () => clearInterval(interval);
      } catch (err) {
        setStatus(STATUS.error);
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', background: '#fdfaf2', fontFamily: F, position: 'relative' }}>
        {/* Dot grid */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(180,140,60,0.1) 1px,transparent 1px)', backgroundSize: '28px 28px', opacity: 0.6, pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: 'linear-gradient(145deg,#2a2218,#1a150e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#e8c97a', boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 3px 10px rgba(0,0,0,0.18)' }}>A</div>
            <span style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: '#1a150e', letterSpacing: '0.02em' }}>Auctions<span style={{ color: '#b8882e' }}>BD</span></span>
          </Link>

          {/* Card */}
          <div style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.97),rgba(250,246,234,0.92))', border: '1px solid rgba(180,140,60,0.2)', borderRadius: 20, padding: '40px 36px', boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 32px rgba(180,140,60,0.1)' }}>

            {/* ── Loading ── */}
            {status === STATUS.loading && (
              <>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(184,136,46,0.08)', border: '2px solid rgba(184,136,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <div style={{ width: 30, height: 30, border: '3px solid rgba(184,136,46,0.2)', borderTopColor: '#b8882e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
                <h2 style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: '#1a150e', marginBottom: 10 }}>Verifying your email…</h2>
                <p style={{ fontFamily: F, color: 'rgba(30,25,20,0.48)', fontSize: 14 }}>Please hold on, this only takes a second.</p>
              </>
            )}

            {/* ── Success ── */}
            {status === STATUS.success && (
              <>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
                  <span style={{ fontSize: 38 }}>✅</span>
                </div>
                <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>Email verified!</h1>
                <p style={{ fontFamily: F, color: 'rgba(30,25,20,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 22 }}>
                  Your account is now active. Welcome to AuctionsBD!
                </p>
                {/* Countdown bar */}
                <div style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(250,246,234,0.8))', border: '1px solid rgba(180,140,60,0.14)', borderRadius: 10, padding: '12px 18px', marginBottom: 18, fontFamily: F, fontSize: 13.5, color: 'rgba(30,25,20,0.5)', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset' }}>
                  Redirecting to your dashboard in{' '}
                  <span style={{ color: '#b8882e', fontWeight: 700, fontFamily: 'monospace' }}>{countdown}s</span>…
                  <div style={{ height: 3, background: 'rgba(180,140,60,0.15)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#b8882e,#e8c97a)', width: `${(countdown / 5) * 100}%`, transition: 'width 1s linear' }} />
                  </div>
                </div>
                <button onClick={() => navigate('/dashboard', { replace: true })} style={{ width: '100%', padding: '13px', background: 'linear-gradient(145deg,#2a2218,#1a150e)', color: '#fff', border: 'none', borderRadius: 8, fontFamily: F, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 14px rgba(0,0,0,0.16)' }}>
                  <span style={GL} />Go to Dashboard →
                </button>
              </>
            )}

            {/* ── Error ── */}
            {status === STATUS.error && (
              <>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(220,50,50,0.07)', border: '2px solid rgba(220,50,50,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
                  <span style={{ fontSize: 38 }}>❌</span>
                </div>
                <h2 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#c53030', marginBottom: 10 }}>Verification failed</h2>
                <p style={{ fontFamily: F, color: 'rgba(30,25,20,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 22 }}>{message}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/register" style={{ display: 'flex', justifyContent: 'center', padding: '13px', background: 'linear-gradient(145deg,#2a2218,#1a150e)', color: '#fff', borderRadius: 8, fontFamily: F, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 14px rgba(0,0,0,0.16)' }}>
                    <span style={GL} />Create a new account
                  </Link>
                  <Link to="/login" style={{ display: 'flex', justifyContent: 'center', padding: '11px', background: 'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(248,244,234,0.7))', color: 'rgba(30,25,20,0.6)', border: '1px solid rgba(180,140,60,0.2)', borderRadius: 8, fontFamily: F, fontSize: 13, fontWeight: 500, textDecoration: 'none', boxShadow: '0 1px 0 rgba(255,255,255,1) inset' }}>
                    Back to Login
                  </Link>
                </div>
                <p style={{ fontFamily: F, fontSize: 12.5, color: 'rgba(30,25,20,0.35)', marginTop: 18, lineHeight: 1.6 }}>
                  Verification links expire after 24 hours. If your link expired, register again with the same email.
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}