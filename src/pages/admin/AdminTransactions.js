import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { AdminShell, EmptyRow, LoadingRow, Pager } from './AdminUsers';

const STATUSES = ['', 'pending', 'completed', 'failed', 'refunded', 'disputed'];

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getTransactions({ page, limit: 20, status });
      setTransactions(res.transactions || []);
      setPagination(res.pagination || { total: 0 });
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  const summary = {
    volume: transactions.reduce((sum, tx) => sum + Number(tx.totalCharged || 0), 0),
    fees: transactions.reduce((sum, tx) => sum + Number(tx.platformFee || 0), 0),
    count: transactions.length,
  };

  return (
    <AdminShell title="Transaction Management" subtitle={`${pagination.total || 0} total records`}>
      <div className="metric-grid" style={{ marginBottom: 20 }}>
        <Metric label="Page Volume" value={`$${summary.volume.toFixed(2)}`} />
        <Metric label="Page Fees" value={`$${summary.fees.toFixed(2)}`} />
        <Metric label="Showing" value={summary.count} />
      </div>

      <div className="tab-strip" style={{ marginBottom: 18 }}>
        {STATUSES.map(item => (
          <button key={item || 'all'} type="button" className={status === item ? 'active' : ''} onClick={() => { setStatus(item); setPage(1); }}>
            {item || 'All'}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="app-table">
          <thead><tr>{['Auction', 'Buyer', 'Seller', 'Amount', 'Fee', 'Status', 'Date'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <LoadingRow colSpan={7} /> : transactions.length === 0 ? <EmptyRow colSpan={7} message="No transactions found" /> : transactions.map(tx => (
              <tr key={tx._id}>
                <td><strong>{tx.auction?.title || 'Auction'}</strong></td>
                <td>{tx.buyer?.name || 'Unknown'}</td>
                <td>{tx.seller?.name || 'Unknown'}</td>
                <td style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>${Number(tx.totalCharged || 0).toFixed(2)}</td>
                <td>${Number(tx.platformFee || 0).toFixed(2)}</td>
                <td><span className={`badge badge-${tx.status === 'completed' ? 'active' : tx.status === 'failed' ? 'ended' : 'scheduled'}`}>{tx.status}</span></td>
                <td>{new Date(tx.paidAt || tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={page} hasNext={transactions.length === 20} onPrev={() => setPage(p => Math.max(1, p - 1))} onNext={() => setPage(p => p + 1)} />
    </AdminShell>
  );
}

function Metric({ label, value }) {
  return <div className="metric-card"><span className="app-muted">{label}</span><strong>{value}</strong></div>;
}
