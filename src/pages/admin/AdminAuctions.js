import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import { AdminShell, EmptyRow, LoadingRow, Pager } from './AdminUsers';

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuctions({ page, limit: 20, status });
      setAuctions(res.auctions || []);
      setPagination(res.pagination || {});
    } catch {
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleFeature = async (id) => {
    await adminAPI.toggleFeatured(id);
    toast.success('Auction updated');
    load();
  };

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;
    await adminAPI.cancelAuction(id, reason);
    toast.success('Auction cancelled');
    load();
  };

  return (
    <AdminShell title="Auction Management" subtitle={`${pagination.total || 0} total auctions`}>
      <div className="tab-strip" style={{ marginBottom: 18 }}>
        {['', 'active', 'scheduled', 'ended', 'sold', 'cancelled'].map(item => (
          <button key={item || 'all'} type="button" className={status === item ? 'active' : ''} onClick={() => { setStatus(item); setPage(1); }}>
            {item || 'All'}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="app-table">
          <thead><tr>{['Auction', 'Seller', 'Price', 'Bids', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <LoadingRow colSpan={6} /> : auctions.length === 0 ? <EmptyRow colSpan={6} message="No auctions found" /> : auctions.map(auction => (
              <tr key={auction._id}>
                <td><strong>{auction.title}</strong>{auction.isFeatured && <p style={{ color: 'var(--yellow)', fontSize: 12 }}>Featured</p>}</td>
                <td>{auction.seller?.name || 'Unknown'}</td>
                <td style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>${Number(auction.currentPrice || 0).toFixed(2)}</td>
                <td>{auction.totalBids || 0}</td>
                <td><span className={`badge badge-${auction.status}`}>{auction.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/auctions/${auction._id}`} className="btn-secondary">View</Link>
                    <button type="button" className="btn-secondary" onClick={() => handleFeature(auction._id)}>{auction.isFeatured ? 'Unfeature' : 'Feature'}</button>
                    {auction.status === 'active' && <button type="button" className="btn-danger" onClick={() => handleCancel(auction._id)}>Cancel</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} hasNext={auctions.length === 20} onPrev={() => setPage(p => Math.max(1, p - 1))} onNext={() => setPage(p => p + 1)} />
    </AdminShell>
  );
}
