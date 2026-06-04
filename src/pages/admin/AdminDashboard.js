import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { AdminShell } from './AdminUsers';

const COLORS = ['#ffd400', '#3b82f6', '#16c784', '#8b5cf6', '#ff3b43', '#06b6d4', '#f97316', '#ec4899'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="app-page" style={{ display: 'grid', placeItems: 'center' }}><div className="spin" /></div>;
  }

  const stats = data?.stats || {};
  const chartData = (data?.monthlyRevenue || []).map(item => ({
    name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    revenue: Number((item.revenue || 0).toFixed(2)),
    volume: Number((item.volume || 0).toFixed(2)),
  }));
  const categories = data?.categoryBreakdown || [];

  return (
    <AdminShell title="Admin Dashboard" subtitle="Platform overview and analytics">
      <div className="metric-grid" style={{ marginBottom: 22 }}>
        <Metric label="Total Users" value={stats.totalUsers || 0} />
        <Metric label="Total Auctions" value={stats.totalAuctions || 0} />
        <Metric label="Active Auctions" value={stats.activeAuctions || 0} />
        <Metric label="Pending Payments" value={stats.pendingPayments || 0} />
        <Metric label="Transactions" value={stats.totalTransactions || 0} />
        <Metric label="Platform Revenue" value={`$${Number(stats.totalRevenue || 0).toFixed(2)}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 20, marginBottom: 22 }}>
        <section className="app-card app-card-pad">
          <h2 style={{ marginBottom: 18 }}>Revenue & Volume</h2>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#9d9d98', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9d9d98', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#ffd400" fill="rgba(255,212,0,0.16)" strokeWidth={2} />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="rgba(59,130,246,0.12)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No transaction data yet.</div>}
        </section>

        <section className="app-card app-card-pad">
          <h2 style={{ marginBottom: 18 }}>Categories</h2>
          {categories.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categories.slice(0, 8)} cx="50%" cy="50%" innerRadius={54} outerRadius={92} dataKey="count" nameKey="_id">
                  {categories.slice(0, 8).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No auction data yet.</div>}
        </section>
      </div>

      <div className="form-grid">
        <RecentList title="Recent Users" link="/admin/users" items={data?.recentUsers || []} render={user => (
          <>
            <strong>{user.name}</strong>
            <p className="app-muted">{user.email}</p>
          </>
        )} />
        <RecentList title="Active Auctions" link="/admin/auctions" items={data?.recentAuctions || []} render={auction => (
          <>
            <strong>{auction.title}</strong>
            <p className="app-muted">{auction.totalBids || 0} bids by {auction.seller?.name || 'seller'}</p>
          </>
        )} />
      </div>
    </AdminShell>
  );
}

function Metric({ label, value }) {
  return <div className="metric-card"><span className="app-muted">{label}</span><strong>{value}</strong></div>;
}

function RecentList({ title, link, items, render }) {
  return (
    <section className="app-card app-card-pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <h2>{title}</h2>
        <Link to={link} style={{ color: 'var(--yellow)', fontWeight: 900 }}>View all</Link>
      </div>
      {items.length ? (
        <div className="form-stack">
          {items.map(item => <article key={item._id} style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{render(item)}</article>)}
        </div>
      ) : <div className="empty-state">Nothing to show yet.</div>}
    </section>
  );
}
