import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCountdown } from '../../hooks/useCountdown';
import { bidAPI, paymentAPI } from '../../services/api';
import { getSocket, joinAuctionRoom, leaveAuctionRoom } from '../../services/socket';

export default function BidPanel({ auction: initialAuction, onUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(initialAuction);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveActivity, setLiveActivity] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const activityRef = useRef(null);
  const { format, isUrgent, isExpired } = useCountdown(auction.endTime);

  useEffect(() => {
    setAuction(initialAuction);
  }, [initialAuction]);

  const minBid = useMemo(
    () => Number((Number(auction.currentPrice || 0) + Number(auction.minimumBidIncrement || 1)).toFixed(2)),
    [auction.currentPrice, auction.minimumBidIncrement]
  );

  const suggestedBids = useMemo(
    () => [minBid, minBid + 5, minBid + 10, minBid + 25],
    [minBid]
  );

  useEffect(() => {
    joinAuctionRoom(auction._id);
    const socket = getSocket();
    if (!socket) return () => leaveAuctionRoom(auction._id);

    const handleNewBid = (data) => {
      if (data.auctionId !== auction._id) return;
      setAuction(prev => ({ ...prev, currentPrice: data.newCurrentPrice, totalBids: data.totalBids, endTime: data.endTime }));
      setBidAmount('');
      setLiveActivity(prev => [
        { id: `${Date.now()}-bid`, type: 'bid', text: `${data.bid.bidder?.name || 'Someone'} bid $${Number(data.bid.amount || 0).toFixed(2)}`, time: new Date() },
        ...prev,
      ].slice(0, 8));
      onUpdate?.(data);
    };

    const handleOutbid = (data) => {
      if (data.auctionId !== auction._id) return;
      toast.error(`You've been outbid. New price: $${data.newAmount}`);
    };

    const handleAuctionEnded = (data) => {
      if (data.auctionId !== auction._id) return;
      setAuction(prev => ({ ...prev, status: 'ended' }));
      const message = data.winner ? `${data.winner.name} won for $${Number(data.finalPrice || 0).toFixed(2)}` : 'Auction ended with no winner';
      setLiveActivity(prev => [{ id: `${Date.now()}-ended`, type: 'ended', text: message, time: new Date() }, ...prev]);
      toast(message, { duration: 6000 });
    };

    const handlePaymentSuccess = (data) => {
      if (data.auctionId !== auction._id) return;
      setAuction(prev => ({
        ...prev,
        status: 'sold',
        paymentStatus: data.method === 'cod' ? 'pending' : 'paid',
      }));
      if (data.orderId || data.order?._id) setOrderId(data.orderId || data.order?._id);
    };

    socket.on('newBid', handleNewBid);
    socket.on('outbid', handleOutbid);
    socket.on('auctionEnded', handleAuctionEnded);
    socket.on('paymentSuccess', handlePaymentSuccess);

    return () => {
      leaveAuctionRoom(auction._id);
      socket.off('newBid', handleNewBid);
      socket.off('outbid', handleOutbid);
      socket.off('auctionEnded', handleAuctionEnded);
      socket.off('paymentSuccess', handlePaymentSuccess);
    };
  }, [auction._id, onUpdate]);

  useEffect(() => {
    const fetchOrderId = async () => {
      if (!user) return;
      const winnerId = typeof auction.winner === 'object' ? auction.winner?._id : auction.winner;
      if (auction.status !== 'sold' || user._id !== winnerId) return;
      try {
        const res = await paymentAPI.getOrderForAuction(auction._id);
        setOrderId(res?.orderId || res?.order?._id || res?._id || null);
      } catch {}
    };
    fetchOrderId();
  }, [auction._id, auction.status, auction.winner, user]);

  useEffect(() => {
    if (activityRef.current) activityRef.current.scrollTop = 0;
  }, [liveActivity]);

  const handleBid = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    const amount = Number(bidAmount);
    if (!amount || amount < minBid) {
      toast.error(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }
    setLoading(true);
    try {
      await bidAPI.place(auction._id, { amount });
      toast.success(`Bid of $${amount.toFixed(2)} placed`);
      setBidAmount('');
    } catch (err) {
      toast.error(err.message || 'Bid failed');
    } finally {
      setLoading(false);
    }
  };

  const isEnded = auction.status === 'ended' || auction.status === 'sold' || isExpired;
  const isOwnAuction = user?._id === (auction.seller?._id || auction.seller);
  const winnerId = typeof auction.winner === 'object' ? auction.winner?._id : auction.winner;
  const isWinner = isEnded && user?._id === winnerId;
  const needsPayment = isWinner && auction.status === 'ended' && auction.paymentStatus !== 'paid';
  const codPlaced = isWinner && auction.status === 'sold' && auction.paymentStatus !== 'paid';
  const isPaid = isWinner && auction.status === 'sold' && auction.paymentStatus === 'paid';
  const displayOrderId = orderId ? String(orderId).slice(-10).toUpperCase() : null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section className="bid-panel-card">
        <span style={{ color: '#8d8d86', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>
          {auction.totalBids === 0 ? 'Starting Bid' : 'Current Bid'}
        </span>
        <strong style={{ display: 'block', marginTop: 4, color: 'var(--yellow)', fontFamily: 'var(--font-mono)', fontSize: 38 }}>
          ${Number(auction.currentPrice || 0).toLocaleString()}
        </strong>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
          {splitCountdown(format()).map(([label, value]) => (
            <div key={label} style={{ minHeight: 72, display: 'grid', placeItems: 'center', border: `1px solid ${isUrgent ? 'rgba(255,59,67,0.55)' : 'rgba(255,212,0,0.34)'}`, borderRadius: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 25 }}>{value}</strong>
                <span style={{ color: '#8d8d86', fontSize: 11, fontWeight: 800 }}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        <InfoLine label="Total Bids" value={auction.totalBids || 0} />
        <InfoLine label="Minimum Bid" value={`$${minBid.toFixed(2)}`} />
        {auction.reservePrice && (
          <InfoLine label="Reserve" value={auction.currentPrice >= auction.reservePrice ? 'Met' : 'Not met'} />
        )}
      </section>

      {!isEnded && !isOwnAuction && (
        <section className="bid-panel-card">
          <h3 style={{ marginBottom: 14 }}>Post Bid</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 14 }}>
            {suggestedBids.map(amount => (
              <button
                key={amount}
                type="button"
                className={bidAmount === amount.toFixed(2) ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setBidAmount(amount.toFixed(2))}
              >
                ${amount.toFixed(2)}
              </button>
            ))}
          </div>

          <form onSubmit={handleBid}>
            <input
              className="form-input"
              type="number"
              placeholder={minBid.toFixed(2)}
              value={bidAmount}
              onChange={event => setBidAmount(event.target.value)}
              min={minBid}
              step="0.01"
              disabled={loading}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 18, marginBottom: 12 }}
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Placing Bid...' : `Post Bid $${bidAmount || minBid.toFixed(2)}`}
            </button>
          </form>

          {auction.buyNowPrice && (
            <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: 10 }}>
              Buy Now ${Number(auction.buyNowPrice).toFixed(2)}
            </button>
          )}
        </section>
      )}

      {isOwnAuction && !isEnded && (
        <StatusCard title="Your auction is live" body="Buyers can bid in real time. You cannot bid on your own listing." />
      )}

      {needsPayment && (
        <StatusCard
          title="Congratulations, you won"
          body="Complete payment to confirm the order."
          action={<button type="button" className="btn-primary" onClick={() => navigate(`/checkout/${auction._id}`)}>Complete Payment</button>}
        />
      )}

      {codPlaced && (
        <StatusCard
          title="Order placed"
          body={`Cash on Delivery is pending${displayOrderId ? ` for order #${displayOrderId}` : ''}.`}
        />
      )}

      {isPaid && (
        <StatusCard
          title="Payment confirmed"
          body={`The seller has been notified${displayOrderId ? ` for order #${displayOrderId}` : ''}.`}
        />
      )}

      {liveActivity.length > 0 && (
        <section className="bid-panel-card">
          <h3 style={{ marginBottom: 12 }}>Live Activity</h3>
          <div ref={activityRef} style={{ maxHeight: 220, overflowY: 'auto', display: 'grid', gap: 8 }}>
            {liveActivity.map(entry => (
              <div key={entry.id} className="animate-rise" style={{ padding: 12, borderRadius: 8, background: '#151515', borderLeft: `3px solid ${entry.type === 'ended' ? 'var(--yellow)' : 'var(--success)'}` }}>
                <p style={{ fontWeight: 800 }}>{entry.text}</p>
                <small style={{ color: '#8d8d86' }}>{entry.time.toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 14, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <span style={{ color: '#8d8d86', fontWeight: 800 }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusCard({ title, body, action }) {
  return (
    <section className="bid-panel-card" style={{ borderColor: 'rgba(255,212,0,0.32)' }}>
      <h3 style={{ color: 'var(--yellow)', marginBottom: 6 }}>{title}</h3>
      <p style={{ color: '#c8c8c0', marginBottom: action ? 16 : 0 }}>{body}</p>
      {action}
    </section>
  );
}

function splitCountdown(value) {
  const parts = value.match(/\d+/g) || ['0', '0', '0'];
  return [
    ['Days', String(parts[0] || '0').padStart(2, '0')],
    ['Hours', String(parts[1] || '0').padStart(2, '0')],
    ['Minutes', String(parts[2] || '0').padStart(2, '0')],
  ];
}
