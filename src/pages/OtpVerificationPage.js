import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OTP_LENGTH = 6;

export default function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loadUser } = useAuth();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => { if (!email) navigate('/register', { replace: true }); }, [email, navigate]);
  useEffect(() => { if (otp.every(Boolean)) handleVerify(otp.join('')); }, [otp]);

  const handleVerify = async (code) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOtp({ email, otp: code });
      if (res.token) localStorage.setItem('token', res.token);
      await loadUser();
      toast.success('Account created. Welcome to AuctionsBD.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await authAPI.resendOtp({ email });
      toast.success('New OTP sent');
      setOtp(Array(OTP_LENGTH).fill(''));
      startCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const startCooldown = (seconds) => {
    setCooldown(seconds);
    const interval = setInterval(() => setCooldown(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    }), 1000);
  };

  return (
    <OtpShell
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to"
      email={email}
      otp={otp}
      setOtp={setOtp}
      inputRefs={inputRefs}
      error={error}
      loading={loading}
      submitLabel="Verify & Create Account"
      onSubmit={handleVerify}
      onResend={handleResend}
      resending={resending}
      cooldown={cooldown}
      backTo="/register"
    />
  );
}

export function OtpShell({ title, subtitle, email, otp, setOtp, inputRefs, error, loading, submitLabel, onSubmit, onResend, resending, cooldown, backTo }) {
  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, index) => { next[index] = char; });
    setOtp(next);
  };

  const submit = (event) => {
    event.preventDefault();
    const code = otp.join('');
    if (code.length === OTP_LENGTH) onSubmit(code);
  };

  return (
    <div className="app-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: 22 }}>
            <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
            <div className="brand-copy"><strong>AuctionsBD</strong><small>Live Online Auctions</small></div>
          </Link>
          <h1 className="app-title">{title}</h1>
          <p className="app-muted">{subtitle}</p>
          <p style={{ color: 'var(--yellow)', fontWeight: 900, wordBreak: 'break-all' }}>{email}</p>
        </div>

        <form onSubmit={submit} className="app-card app-card-pad">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={element => { inputRefs.current[index] = element; }}
                className="app-input"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={event => handleChange(index, event.target.value)}
                onPaste={index === 0 ? handlePaste : undefined}
                style={{ width: 50, height: 58, textAlign: 'center', fontSize: 24, fontFamily: 'var(--font-mono)', borderColor: digit ? 'var(--yellow)' : undefined }}
              />
            ))}
          </div>

          {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: 14, fontWeight: 800 }}>{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading || otp.join('').length < OTP_LENGTH} style={{ width: '100%', marginBottom: 14 }}>
            {loading ? 'Verifying...' : submitLabel}
          </button>

          <button type="button" className="btn-secondary" onClick={onResend} disabled={resending || cooldown > 0} style={{ width: '100%' }}>
            {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to={backTo} style={{ color: 'var(--yellow)', fontWeight: 900 }}>Go back</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
