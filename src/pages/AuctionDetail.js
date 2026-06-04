import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import BidPanel from '../components/auction/BidPanel';
import { useAuth } from '../context/AuthContext';
import { auctionAPI, bidAPI } from '../services/api';

export default function AuctionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [bids, setBids] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [auctionRes, bidsRes] = await Promise.all([
          auctionAPI.getOne(id),
          bidAPI.getForAuction(id, { limit: 20 }),
        ]);
        if (!active) return;
        setAuction(auctionRes.auction);
        setIsWatching(Boolean(auctionRes.isWatching));
        setBids(bidsRes.bids || []);
      } catch {
        toast.error('Failed to load auction');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const handleWatch = async () => {
    if (!user) {
      toast.error('Please log in to watch auctions');
      return;
    }
    try {
      const res = await auctionAPI.toggleWatch(id);
      setIsWatching(res.isWatching);
      toast.success(res.message);
    } catch {}
  };

  if (loading) {
    return (
      <div className="detail-page" style={{ display: 'grid', placeItems: 'center' }}>
        <div className="spin" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="detail-page" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <h1>Auction not found</h1>
          <Link to="/auctions" className="btn-primary" style={{ marginTop: 18 }}>Browse Auctions</Link>
        </div>
      </div>
    );
  }

  const images = auction.images || [];

  return (
    <div className="detail-page">
      <div className="container">
        <div style={{ color: '#8e8e88', fontSize: 13, fontWeight: 800, marginBottom: 24 }}>
          <Link to="/">Home</Link> / <Link to="/auctions">Auctions</Link> / <Link to={`/auctions?category=${auction.category}`}>{auction.category}</Link>
        </div>

        <div className="detail-grid">
          <main>
            <div className="detail-image">
              {images[activeImage]?.url ? (
                <img src={images[activeImage].url} alt={auction.title} />
              ) : (
                <div style={{ minHeight: 420, display: 'grid', placeItems: 'center', color: '#777', fontWeight: 900 }}>
                  No Image
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '12px 0 4px' }}>
                {images.map((image, index) => (
                  <button
                    key={image.url || index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    style={{
                      width: 82,
                      height: 72,
                      flex: '0 0 auto',
                      overflow: 'hidden',
                      borderRadius: 8,
                      background: '#111',
                      border: index === activeImage ? '2px solid var(--yellow)' : '1px solid rgba(255,255,255,0.16)',
                    }}
                  >
                    <img src={image.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            <section style={{ padding: '28px 0' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span className="badge badge-scheduled">{auction.category}</span>
                <span className={`badge badge-${auction.status}`}>{auction.status}</span>
                {auction.condition && <span className="badge" style={{ background: '#191919', color: '#d8d8d2' }}>{auction.condition}</span>}
              </div>

              <h1 style={{ fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 1.05, marginBottom: 16 }}>{auction.title}</h1>

              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', color: '#a6a69f', fontWeight: 700, marginBottom: 24 }}>
                <span>{auction.viewCount || 0} views</span>
                <span>Listed {formatDistanceToNow(new Date(auction.createdAt), { addSuffix: true })}</span>
                <span>{auction.totalBids || 0} bids</span>
                {auction.seller && <span>Seller: {auction.seller.name}</span>}
                <button type="button" className={isWatching ? 'btn-primary' : 'btn-secondary'} onClick={handleWatch}>
                  {isWatching ? 'Watching' : 'Watch'}
                </button>
              </div>

              <div className="detail-panel">
                <div className="tabs">
                  {[
                    ['description', 'Description'],
                    ['shipping', 'Shipping'],
                    ['bids', `Bid History (${bids.length})`],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={activeTab === key ? 'active' : ''}
                      onClick={() => setActiveTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 22 }}>
                  {activeTab === 'description' && (
                    <div style={{ color: '#c6c6bf', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {auction.description}
                      {auction.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                          {auction.tags.map(tag => <span key={tag} className="badge">#{tag}</span>)}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <InfoList rows={[
                      ['Shipping Cost', auction.shipping?.isFree ? 'Free' : `$${Number(auction.shipping?.cost || 0).toFixed(2)}`],
                      ['Ships From', auction.shipping?.location || 'Not specified'],
                      ['Handling Time', `${auction.shipping?.handlingTime || 3} business days`],
                      ['International', auction.shipping?.international ? 'Available' : 'Not available'],
                    ]} />
                  )}

                  {activeTab === 'bids' && (
                    bids.length === 0 ? (
                      <p style={{ color: '#999', textAlign: 'center', padding: 28 }}>No bids yet. Be the first.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: 10 }}>
                        {bids.map((bid, index) => (
                          <div key={bid._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 14, borderRadius: 8, background: index === 0 ? 'rgba(255,212,0,0.12)' : '#151515', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div>
                              <strong>{bid.bidder?.name || 'Anonymous'}</strong>
                              <p style={{ color: '#8d8d86', fontSize: 12 }}>{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</p>
                            </div>
                            <strong style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>${Number(bid.amount || 0).toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          </main>

          <aside style={{ position: 'sticky', top: 112 }}>
            <BidPanel
              auction={auction}
              onUpdate={(data) => {
                setAuction(prev => ({ ...prev, currentPrice: data.newCurrentPrice, totalBids: data.totalBids, endTime: data.endTime }));
                if (data.bid) setBids(prev => [data.bid, ...prev]);
              }}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoList({ rows }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 18, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ color: '#8d8d86' }}>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
