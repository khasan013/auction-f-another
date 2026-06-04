import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { OtpShell } from './OtpVerificationPage';

const OTP_LENGTH = 6;

export default function VerifyResetOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => { if (!email) navigate('/forgot-password', { replace: true }); }, [email, navigate]);
  useEffect(() => { if (otp.every(Boolean)) handleVerify(otp.join('')); }, [otp]);

  const handleVerify = async (code) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyResetOtp({ email, otp: code });
      toast.success('OTP verified. Set your new password.');
      navigate('/set-new-password', { state: { email, resetToken: res.resetToken }, replace: true });
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
      await authAPI.sendResetOtp({ email });
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
      title="Check your inbox"
      subtitle="Enter the reset code sent to"
      email={email}
      otp={otp}
      setOtp={setOtp}
      inputRefs={inputRefs}
      error={error}
      loading={loading}
      submitLabel="Verify OTP"
      onSubmit={handleVerify}
      onResend={handleResend}
      resending={resending}
      cooldown={cooldown}
      backTo="/forgot-password"
    />
  );
}
