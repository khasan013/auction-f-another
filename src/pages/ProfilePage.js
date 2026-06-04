import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await userAPI.updateAvatar(formData);
      updateUser({ ...user, avatar: res.avatar });
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile picture');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="app-page">
      <div className="container" style={{ maxWidth: 760 }}>
        <p className="app-muted">Account</p>
        <h1 className="app-title" style={{ marginBottom: 24 }}>Profile Settings</h1>

        <section className="app-card app-card-pad" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 22 }}>
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--yellow)' }} />
          ) : (
            <div className="avatar-circle" style={{ width: 88, height: 88, fontSize: 32 }}>{user?.name?.[0]}</div>
          )}
          <div>
            <h2>Profile Picture</h2>
            <p className="app-muted" style={{ marginBottom: 12 }}>JPG, PNG, or WebP up to 5MB.</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            <button type="button" className="btn-secondary" disabled={avatarLoading} onClick={() => fileInputRef.current?.click()}>
              {avatarLoading ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>
        </section>

        <section className="app-card app-card-pad" style={{ marginBottom: 18 }}>
          <h2 style={{ marginBottom: 18 }}>Profile Information</h2>
          <form onSubmit={handleProfile} className="form-stack">
            <div className="form-grid">
              <Field label="Full Name"><input className="app-input" value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} /></Field>
              <Field label="Phone"><input className="app-input" type="tel" value={form.phone} onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))} /></Field>
              <Field label="Date of Birth"><input className="app-input" type="date" value={form.dateOfBirth} max={maxDob.toISOString().split('T')[0]} onChange={event => setForm(prev => ({ ...prev, dateOfBirth: event.target.value }))} /></Field>
            </div>
            <Field label="Bio"><textarea className="app-textarea" value={form.bio} maxLength={500} onChange={event => setForm(prev => ({ ...prev, bio: event.target.value }))} /></Field>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </section>

        <section className="app-card app-card-pad">
          <h2 style={{ marginBottom: 18 }}>Change Password</h2>
          <form onSubmit={handlePassword} className="form-stack">
            <Field label="Current Password"><input className="app-input" type="password" value={pwForm.currentPassword} minLength={6} required onChange={event => setPwForm(prev => ({ ...prev, currentPassword: event.target.value }))} /></Field>
            <Field label="New Password"><input className="app-input" type="password" value={pwForm.newPassword} minLength={6} required onChange={event => setPwForm(prev => ({ ...prev, newPassword: event.target.value }))} /></Field>
            <Field label="Confirm New Password"><input className="app-input" type="password" value={pwForm.confirm} minLength={6} required onChange={event => setPwForm(prev => ({ ...prev, confirm: event.target.value }))} /></Field>
            <button type="submit" className="btn-primary" disabled={savingPw}>{savingPw ? 'Updating...' : 'Update Password'}</button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label><span className="app-label">{label}</span>{children}</label>;
}
