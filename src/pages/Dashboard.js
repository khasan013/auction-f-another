import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';
import AuctionCard from '../components/auction/AuctionCard';
import { auctionAPI, bidAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [bids, setBids] = useState([]);
  const [listings, setListings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      bidAPI.getMyBids({ limit: 10 }),
      auctionAPI.getMyListings({ limit: 8 }),
      userAPI.getWatchlist(),
      userAPI.getNotifications({ limit: 20 }),
    ])
      .then(([bidRes, listingRes, watchRes, notificationRes]) => {
        setBids(bidRes.bids || []);
        setListings(listingRes.auctions || []);
        setWatchlist(watchRes.watchlist || []);
        setNotifications(notificationRes.notifications || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await userAPI.markNotificationsRead([]);
    setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
  };

  return (
    <div className="app-page">
      <div className="container">
        <section className="app-card app-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
          <Avatar user={user} />
          <div style={{ flex: 1 }}>
            <p className="app-muted">Dashboard</p>
            <h1 style={{ fontSize: 28 }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="app-muted">{user?.email} · {user?.isVerified ? 'Verified' : 'Email not verified'}</p>
          </div>
          <Link to="/profile" className="btn-secondary">Edit Profile</Link>
        </section>

        <nav className="tab-strip" style={{ marginBottom: 22 }}>
          {[
            ['overview', 'Overview'],
            ['bids', 'My Bids'],
            ['listings', 'My Listings'],
            ['watchlist', 'Watchlist'],
            ['notifications', 'Notifications'],
            ['transactions', 'Transactions'],
          ].map(([key, label]) => (
            <button key={key} type="button" className={tab === key ? 'active' : ''} onClick={() => setSearchParams({ tab: key })}>
              {label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><div className="spin" /></div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="metric-grid">
                <Metric label="Total Bids" value={bids.length} />
                <Metric label="Active Bids" value={bids.filter(bid => bid.status === 'active').length} />
                <Metric label="My Listings" value={listings.length} />
                <Metric label="Watchlist" value={watchlist.length} />
              </div>
            )}

            {tab === 'bids' && <BidList bids={bids} />}

            {tab === 'listings' && (
              <GridOrEmpty items={listings} message="You have not listed any auctions yet." cta={<Link to="/auctions/create" className="btn-primary">Post Auction</Link>} />
            )}

            {tab === 'watchlist' && (
              <GridOrEmpty items={watchlist} message="Your watchlist is empty." cta={<Link to="/auctions" className="btn-primary">Browse Auctions</Link>} />
            )}

            {tab === 'notifications' && (
              <section className="app-card app-card-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <h2>Notifications</h2>
                  <button type="button" className="btn-secondary" onClick={markAllRead}>Mark all read</button>
                </div>
                {notifications.length === 0 ? <Empty message="No notifications yet." /> : (
                  <div className="form-stack">
                    {notifications.map(notification => (
                      <article key={notification._id} className="app-card" style={{ padding: 16, background: notification.isRead ? '#101010' : 'rgba(255,212,0,0.1)' }}>
                        <strong>{notification.title}</strong>
                        <p className="app-muted">{notification.message}</p>
                        <small className="app-muted">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</small>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === 'transactions' && (
              <section className="app-card app-card-pad">
                <h2>Transactions</h2>
                <p className="app-muted" style={{ marginTop: 8 }}>Payment history is available from checkout and admin transaction records.</p>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Avatar({ user }) {
  return user?.avatar?.url ? (
    <img src={user.avatar.url} alt="" style={{ width: 66, height: 66, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--yellow)' }} />
  ) : (
    <div className="avatar-circle" style={{ width: 66, height: 66, fontSize: 24 }}>{user?.name?.[0]}</div>
  );
}

function Metric({ label, value }) {
  return <div className="metric-card"><span className="app-muted">{label}</span><strong>{value}</strong></div>;
}

function BidList({ bids }) {
  if (!bids.length) return <Empty message="You have not placed any bids yet." />;
  return (
    <div className="form-stack">
      {bids.map(bid => (
        <article key={bid._id} className="app-card app-card-pad" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {bid.auction?.images?.[0]?.url && <img src={bid.auction.images[0].url} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover' }} />}
          <div style={{ flex: 1 }}>
            <strong>{bid.auction?.title || 'Auction'}</strong>
            <p className="app-muted">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</p>
          </div>
          <strong style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>${Number(bid.amount || 0).toFixed(2)}</strong>
          {bid.auction?._id && <Link to={`/auctions/${bid.auction._id}`} className="btn-secondary">View</Link>}
        </article>
      ))}
    </div>
  );
}

function GridOrEmpty({ items, message, cta }) {
  if (!items.length) return <Empty message={message} cta={cta} />;
  return <div className="grid-auto">{items.map(item => <AuctionCard key={item._id} auction={item} />)}</div>;
}

function Empty({ message, cta }) {
  return <div className="empty-state"><p>{message}</p>{cta && <div style={{ marginTop: 18 }}>{cta}</div>}</div>;
}
