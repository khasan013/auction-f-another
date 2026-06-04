import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SetNewPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => { if (!resetToken) navigate('/forgot-password', { replace: true }); }, [resetToken, navigate]);
  useEffect(() => {
    if (!success) return undefined;
    let seconds = 5;
    const interval = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      if (seconds <= 0) {
        clearInterval(interval);
        navigate('/dashboard', { replace: true });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [success, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await authAPI.resetPasswordWithToken({ email, resetToken, password: form.password });
      if (res.token) localStorage.setItem('token', res.token);
      await loadUser();
      toast.success('Password updated successfully');
      setSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: 22 }}>
            <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
            <div className="brand-copy"><strong>AuctionsBD</strong><small>Live Online Auctions</small></div>
          </Link>
          <h1 className="app-title">{success ? 'Password updated' : 'Set new password'}</h1>
          <p className="app-muted">{success ? 'You are signed in now.' : 'Choose a strong password for your account.'}</p>
        </div>

        <div className="app-card app-card-pad">
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <p className="app-muted" style={{ marginBottom: 18 }}>Redirecting to dashboard in <strong style={{ color: 'var(--yellow)' }}>{countdown}s</strong></p>
              <button type="button" className="btn-primary" onClick={() => navigate('/dashboard', { replace: true })}>Go to Dashboard</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-stack">
              <label><span className="app-label">New Password</span><input className="app-input" type="password" value={form.password} onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))} /></label>
              <label><span className="app-label">Confirm Password</span><input className="app-input" type="password" value={form.confirm} onChange={event => setForm(prev => ({ ...prev, confirm: event.target.value }))} /></label>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Set New Password'}</button>
              <Link to="/forgot-password" style={{ color: 'var(--yellow)', textAlign: 'center', fontWeight: 900 }}>Start over</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
