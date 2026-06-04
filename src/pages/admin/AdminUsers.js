import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, limit: 20, search });
      setUsers(res.users || []);
      setPagination(res.pagination || {});
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search]);

  const handleBan = async (id, isBanned, name) => {
    const reason = isBanned ? undefined : prompt(`Ban reason for ${name}:`);
    if (!isBanned && !reason) return;
    try {
      isBanned ? await adminAPI.unbanUser(id) : await adminAPI.banUser(id, reason);
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, role);
      toast.success('Role updated');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  return (
    <AdminShell title="User Management" subtitle={`${pagination.total || 0} total users`}>
      <input className="app-input" placeholder="Search by name or email" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} style={{ maxWidth: 420, marginBottom: 18 }} />
      <div className="table-wrap">
        <table className="app-table">
          <thead><tr>{['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <LoadingRow colSpan={6} /> : users.length === 0 ? <EmptyRow colSpan={6} message="No users found" /> : users.map(user => (
              <tr key={user._id}>
                <td><strong>{user.name}</strong>{user.isBanned && <p style={{ color: 'var(--danger)', fontSize: 12 }}>Banned: {user.banReason}</p>}</td>
                <td>{user.email}</td>
                <td>
                  <select className="app-select" value={user.role} onChange={event => handleRoleChange(user._id, event.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{user.isVerified ? <span className="badge badge-active">Verified</span> : <span className="badge badge-draft">Unverified</span>}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td><button type="button" className={user.isBanned ? 'btn-secondary' : 'btn-danger'} onClick={() => handleBan(user._id, user.isBanned, user.name)}>{user.isBanned ? 'Unban' : 'Ban'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} hasNext={users.length === 20} onPrev={() => setPage(p => Math.max(1, p - 1))} onNext={() => setPage(p => p + 1)} />
    </AdminShell>
  );
}

export function AdminShell({ title, subtitle, children }) {
  return (
    <div className="app-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, marginBottom: 24 }}>
          <div><p className="app-muted">Admin</p><h1 className="app-title">{title}</h1>{subtitle && <p className="app-muted">{subtitle}</p>}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="btn-secondary" href="/admin">Dashboard</a>
            <a className="btn-secondary" href="/admin/users">Users</a>
            <a className="btn-secondary" href="/admin/auctions">Auctions</a>
            <a className="btn-secondary" href="/admin/transactions">Transactions</a>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function LoadingRow({ colSpan }) {
  return <tr><td colSpan={colSpan} style={{ textAlign: 'center', padding: 48 }}><div className="spin" style={{ margin: '0 auto' }} /></td></tr>;
}

export function EmptyRow({ colSpan, message }) {
  return <tr><td colSpan={colSpan} className="empty-state">{message}</td></tr>;
}

export function Pager({ page, hasNext, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22, alignItems: 'center' }}>
      <button className="btn-secondary" disabled={page === 1} onClick={onPrev}>Prev</button>
      <span className="app-muted">Page {page}</span>
      <button className="btn-secondary" disabled={!hasNext} onClick={onNext}>Next</button>
    </div>
  );
}
