import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS = { idle: 'idle', loading: 'loading', success: 'success', error: 'error' };

export default function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { loadUser } = useAuth();

  const [status, setStatus]   = useState(STATUS.idle);
  const [errMsg, setErrMsg]   = useState('');
  const [countdown, setCountdown] = useState(5);
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [form, setForm]       = useState({ password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [strength, setStrength] = useState(0);

  // Password strength scorer
  useEffect(() => {
    const pw = form.password;
    let score = 0;
    if (pw.length >= 6)                         score++;
    if (pw.length >= 10)                        score++;
    if (/[A-Z]/.test(pw))                       score++;
    if (/[0-9]/.test(pw))                       score++;
    if (/[^A-Za-z0-9]/.test(pw))               score++;
    setStrength(score);
  }, [form.password]);

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColor = ['', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#10b981'];

  const validate = () => {
    const e = {};
    if (!form.password)              e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (!form.confirm)               e.confirm  = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStatus(STATUS.loading);
    try {
      const res = await authAPI.resetPassword(token, form.password);
      if (res.token) localStorage.setItem('token', res.token);
      await loadUser();
      setStatus(STATUS.success);

      // Auto-redirect countdown
      let secs = 5;
      const interval = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) {
          clearInterval(interval);
          navigate('/dashboard', { replace: true });
        }
      }, 1000);
    } catch (err) {
      setStatus(STATUS.error);
      setErrMsg(err.message || 'This link is invalid or has expired.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '80px 16px',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 60%), var(--bg-base)',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)', fontSize: 26,
            letterSpacing: 3, display: 'block', marginBottom: 28,
          }}>
            AUCTIONS<span style={{ color: 'var(--gold)' }}>BD</span>
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {status === STATUS.success ? 'Password reset!' : 'Set new password'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {status === STATUS.success
              ? 'You\'re all set'
              : status === STATUS.error
                ? 'Something went wrong'
                : 'Choose a strong, unique password'}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 20, padding: 32,
          textAlign: status !== STATUS.idle && status !== STATUS.loading ? 'center' : 'left',
        }}>

          {/* ── Success ── */}
          {status === STATUS.success && (
            <>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                border: '2px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px',
                animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }}>
                <span style={{ fontSize: 44 }}>🔓</span>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)', marginBottom: 12 }}>
                Password updated!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Your password has been changed successfully. You are now signed in.
              </p>

              {/* Countdown bar */}
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 20px',
                marginBottom: 20, fontSize: 14,
                color: 'var(--text-secondary)',
              }}>
                Redirecting to dashboard in{' '}
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {countdown}s
                </span>
                …
                <div style={{
                  height: 3, background: 'var(--border)',
                  borderRadius: 2, marginTop: 10, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: 'var(--gold)',
                    width: `${(countdown / 5) * 100}%`,
                    transition: 'width 1s linear',
                  }} />
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate('/dashboard', { replace: true })}
              >
                Go to Dashboard →
              </button>
            </>
          )}

          {/* ── Error ── */}
          {status === STATUS.error && (
            <>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                border: '2px solid rgba(239,68,68,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px',
              }}>
                <span style={{ fontSize: 44 }}>🔒</span>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--danger)', marginBottom: 12 }}>
                Link expired or invalid
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                {errMsg}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link
                  to="/forgot-password"
                  className="btn btn-primary"
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  Request a new reset link
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  Back to Login
                </Link>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
                Reset links expire after 1 hour. Request a fresh one above.
              </p>
            </>
          )}

          {/* ── Form (idle + loading) ── */}
          {(status === STATUS.idle || status === STATUS.loading) && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* New password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    style={{
                      paddingRight: 44,
                      ...(errors.password ? { borderColor: 'var(--danger)' } : {}),
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', color: 'var(--text-muted)',
                      fontSize: 18, padding: 2,
                    }}
                    tabIndex={-1}
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}

                {/* Strength meter */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength
                            ? strengthColor[strength]
                            : 'var(--border)',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontSize: 12,
                      color: strengthColor[strength] || 'var(--text-muted)',
                      fontWeight: 600,
                    }}>
                      {strengthLabel[strength] || ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showCf ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                    style={{
                      paddingRight: 44,
                      ...(errors.confirm ? { borderColor: 'var(--danger)' } : {}),
                      ...(form.confirm && form.confirm === form.password
                        ? { borderColor: 'var(--success)' } : {}),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', color: 'var(--text-muted)',
                      fontSize: 18, padding: 2,
                    }}
                    tabIndex={-1}
                  >
                    {showCf ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm && <span className="form-error">{errors.confirm}</span>}
                {form.confirm && form.confirm === form.password && (
                  <span style={{ fontSize: 12, color: 'var(--success)', marginTop: 2 }}>
                    ✓ Passwords match
                  </span>
                )}
              </div>

              {/* Password tips */}
              <div style={{
                padding: '12px 14px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 13,
                color: 'var(--text-muted)', lineHeight: 1.7,
              }}>
                💡 Use at least 6 characters, mix uppercase, numbers, and symbols for a stronger password.
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={status === STATUS.loading}
                style={{ width: '100%' }}
              >
                {status === STATUS.loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 16, height: 16,
                      border: '2px solid #00000040',
                      borderTopColor: '#000',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      display: 'inline-block',
                    }} />
                    Resetting password…
                  </span>
                ) : 'Reset Password'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>
                  ← Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}