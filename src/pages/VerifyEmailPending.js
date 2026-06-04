import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const F = "'Inter',sans-serif";

export default function VerifyEmailPending() {
  const location              = useLocation();
  const email                 = location.state?.email || 'your email';
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await authAPI.forgotVerification(email);
      setResent(true);
      toast.success('Verification email resent!');
      // 60 second cooldown
      let secs = 60;
      setCooldown(secs);
      const interval = setInterval(() => {
        secs -= 1;
        setCooldown(secs);
        if (secs <= 0) clearInterval(interval);
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to resend. Try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.04)} }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px', background: '#fdfaf2', fontFamily: F, position: 'relative' }}>
        {/* Dot grid */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(180,140,60,0.1) 1px,transparent 1px)', backgroundSize: '28px 28px', opacity: 0.6, pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: 'linear-gradient(145deg,#2a2218,#1a150e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#e8c97a', boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 3px 10px rgba(0,0,0,0.18)' }}>A</div>
            <span style={{ fontFamily: F, fontSize: 20, fontWeight: 700, color: '#1a150e', letterSpacing: '0.02em' }}>Auctions<span style={{ color: '#b8882e' }}>BD</span></span>
          </Link>

          {/* Card */}
          <div style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.97),rgba(250,246,234,0.92))', border: '1px solid rgba(180,140,60,0.2)', borderRadius: 20, padding: '40px 36px', boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 8px 32px rgba(180,140,60,0.1)' }}>

            {/* Animated envelope */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(184,136,46,0.08)', border: '2px solid rgba(184,136,46,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', animation: 'pulse 2.5s ease-in-out infinite' }}>
              <span style={{ fontSize: 36 }}>📬</span>
            </div>

            <h1 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#1a150e', marginBottom: 10 }}>Check your inbox</h1>

            <p style={{ fontFamily: F, color: 'rgba(30,25,20,0.5)', fontSize: 14, lineHeight: 1.75, marginBottom: 6 }}>We sent a verification link to</p>
            <p style={{ fontFamily: F, color: '#b8882e', fontWeight: 700, fontSize: 14.5, marginBottom: 24, wordBreak: 'break-all' }}>{email}</p>

            {/* Steps */}
            <div style={{ background: 'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(250,246,234,0.8))', border: '1px solid rgba(180,140,60,0.14)', borderRadius: 12, padding: '14px 16px', marginBottom: 24, textAlign: 'left', boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset' }}>
              {[
                { n: '1', text: 'Open the email from AuctionsBD' },
                { n: '2', text: 'Click the "Verify my email" button' },
                { n: '3', text: "You'll be redirected back and signed in automatically" },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderBottom: step.n !== '3' ? '1px solid rgba(180,140,60,0.1)' : 'none' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: 'rgba(184,136,46,0.1)', border: '1px solid rgba(184,136,46,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#9a6f2a', fontFamily: F }}>{step.n}</span>
                  <span style={{ fontFamily: F, fontSize: 13.5, color: 'rgba(30,25,20,0.55)', paddingTop: 3 }}>{step.text}</span>
                </div>
              ))}
            </div>

            {/* Resend */}
            <p style={{ fontFamily: F, fontSize: 13.5, color: 'rgba(30,25,20,0.42)', marginBottom: 12 }}>Didn't receive the email? Check your spam folder, or:</p>
            <button onClick={handleResend} disabled={resending || cooldown > 0}
              style={{ width: '100%', padding: '11px', marginBottom: 16, background: 'linear-gradient(145deg,rgba(255,255,255,0.9),rgba(248,244,234,0.7))', color: 'rgba(30,25,20,0.6)', border: '1px solid rgba(180,140,60,0.2)', borderRadius: 8, fontFamily: F, fontSize: 13, fontWeight: 500, cursor: (resending || cooldown > 0) ? 'not-allowed' : 'pointer', boxShadow: '0 1px 0 rgba(255,255,255,1) inset', transition: 'all 0.2s' }}>
              {resending ? 'Sending…' : cooldown > 0 ? `Resend available in ${cooldown}s` : resent ? '✓ Resend another email' : '↺ Resend verification email'}
            </button>

            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(180,140,60,0.18),transparent)', margin: '4px 0 18px' }} />

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link to="/login" style={{ fontFamily: F, fontSize: 13.5, color: 'rgba(30,25,20,0.42)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#9a6f2a'}
                onMouseLeave={e => e.target.style.color = 'rgba(30,25,20,0.42)'}
              >← Back to Login</Link>
              <span style={{ color: 'rgba(180,140,60,0.3)', fontSize: 14 }}>|</span>
              <Link to="/" style={{ fontFamily: F, fontSize: 13.5, color: 'rgba(30,25,20,0.42)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#9a6f2a'}
                onMouseLeave={e => e.target.style.color = 'rgba(30,25,20,0.42)'}
              >Go to Homepage</Link>
            </div>
          </div>

          <p style={{ fontFamily: F, fontSize: 12, color: 'rgba(30,25,20,0.32)', marginTop: 20 }}>The verification link expires in 24 hours.</p>
        </div>
      </div>
    </>
  );
}