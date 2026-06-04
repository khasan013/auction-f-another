import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { AuthLayout } from './LoginPage';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = key => event => setForm(prev => ({ ...prev, [key]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Invalid email address';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6) next.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    try {
      await authAPI.sendOtp({ name: form.name, email: form.email, password: form.password });
      toast.success('OTP sent. Check your inbox.');
      navigate('/verify-otp', { state: { email: form.email, name: form.name }, replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join AuctionsBD and start bidding today">
      <form onSubmit={handleSubmit} className="form-stack">
        <Field label="Full Name" value={form.name} onChange={set('name')} error={errors.name} placeholder="John Doe" />
        <Field label="Email Address" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
        <Field label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="Min. 6 characters" />
        <Field label="Confirm Password" type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} placeholder="Repeat your password" />

        <div className="app-card" style={{ padding: 14, color: '#cfcfc8', background: '#111' }}>
          We will send a 6-digit OTP to your email. Your account is created after verification.
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Continue'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 22 }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--yellow)', fontWeight: 900 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}

function Field({ label, type = 'text', value, onChange, error, placeholder }) {
  return (
    <label>
      <span className="app-label">{label}</span>
      <input
        className="app-input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={error ? { borderColor: 'var(--danger)' } : undefined}
      />
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}
