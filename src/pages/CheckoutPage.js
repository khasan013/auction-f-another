import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auctionAPI, paymentAPI } from '../services/api';

export default function CheckoutPage() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState('cod');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh',
  });

  useEffect(() => {
    let active = true;
    auctionAPI.getOne(auctionId)
      .then(res => {
        if (active) setAuction(res.auction);
      })
      .catch(() => toast.error('Failed to load checkout'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [auctionId]);

  const setAddress = key => event => setShippingAddress(prev => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { method, shippingAddress };
      if (method === 'cod') {
        await paymentAPI.confirm(auctionId, payload);
        toast.success('Order placed successfully');
        navigate(`/auctions/${auctionId}`);
      } else {
        const res = await paymentAPI.sslcommerzInit(auctionId, payload);
        const redirectUrl = res.url || res.GatewayPageURL || res.gatewayUrl;
        if (redirectUrl) window.location.href = redirectUrl;
        else toast.error('Payment gateway URL not returned');
      }
    } catch (err) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="app-page" style={{ display: 'grid', placeItems: 'center' }}><div className="spin" /></div>;
  }

  if (!auction) {
    return (
      <div className="app-page" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <h1>Checkout unavailable</h1>
          <Link to="/auctions" className="btn-primary" style={{ marginTop: 18 }}>Browse Auctions</Link>
        </div>
      </div>
    );
  }

  const shippingCost = auction.shipping?.isFree ? 0 : Number(auction.shipping?.cost || 0);
  const total = Number(auction.currentPrice || 0) + shippingCost;

  return (
    <div className="app-page">
      <div className="container">
        <p className="app-muted">Secure Checkout</p>
        <h1 className="app-title" style={{ marginBottom: 24 }}>Complete Purchase</h1>

        <div className="detail-grid">
          <form onSubmit={handleSubmit} className="form-stack">
            <section className="app-card app-card-pad form-stack">
              <h2>Shipping Address</h2>
              <div className="form-grid">
                {[
                  ['Full Name', 'name'],
                  ['Phone', 'phone'],
                  ['Street Address', 'street'],
                  ['City', 'city'],
                  ['State / Division', 'state'],
                  ['Postal Code', 'zipCode'],
                  ['Country', 'country'],
                ].map(([label, key]) => (
                  <label key={key}>
                    <span className="app-label">{label}</span>
                    <input className="app-input" value={shippingAddress[key]} onChange={setAddress(key)} required />
                  </label>
                ))}
              </div>
            </section>

            <section className="app-card app-card-pad form-stack">
              <h2>Payment Method</h2>
              <label className="app-check">
                <input type="radio" name="method" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                Cash on Delivery
              </label>
              <label className="app-check">
                <input type="radio" name="method" checked={method === 'sslcommerz'} onChange={() => setMethod('sslcommerz')} />
                Online Payment
              </label>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Processing...' : method === 'cod' ? 'Place COD Order' : 'Pay Online'}
              </button>
            </section>
          </form>

          <aside className="app-card app-card-pad" style={{ position: 'sticky', top: 112 }}>
            <h2 style={{ marginBottom: 16 }}>Order Summary</h2>
            {auction.images?.[0]?.url && <img src={auction.images[0].url} alt="" style={{ width: '100%', aspectRatio: '1 / .65', objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />}
            <h3>{auction.title}</h3>
            <Info label="Winning Bid" value={`$${Number(auction.currentPrice || 0).toFixed(2)}`} />
            <Info label="Shipping" value={shippingCost ? `$${shippingCost.toFixed(2)}` : 'Free'} />
            <Info label="Total" value={`$${total.toFixed(2)}`} highlight />
          </aside>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 14, marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <span className="app-muted">{label}</span>
      <strong style={highlight ? { color: 'var(--yellow)', fontFamily: 'var(--font-mono)', fontSize: 20 } : undefined}>{value}</strong>
    </div>
  );
}
