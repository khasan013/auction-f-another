import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand" style={{ marginBottom: 16 }}>
            <div className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="brand-copy">
              <strong>AuctionsBD</strong>
              <small>Live Online Auctions</small>
            </div>
          </Link>
          <p style={{ maxWidth: 310 }}>
            A real-time auction marketplace for trusted buying, selling, bidding, payments, and seller management.
          </p>
        </div>

        <FooterColumn title="Marketplace" links={[
          ['Browse Auctions', '/auctions'],
          ['Vehicles', '/auctions?category=Vehicles'],
          ['Electronics', '/auctions?category=Electronics'],
          ['Featured', '/auctions?isFeatured=true'],
        ]} />
        <FooterColumn title="Account" links={[
          ['Dashboard', '/dashboard'],
          ['My Bids', '/dashboard?tab=bids'],
          ['Post Auction', '/auctions/create'],
          ['Profile', '/profile'],
        ]} />
        <FooterColumn title="Support" links={[
          ['Transactions', '/dashboard?tab=transactions'],
          ['Watchlist', '/dashboard?tab=watchlist'],
          ['Notifications', '/dashboard?tab=notifications'],
          ['Admin', '/admin'],
        ]} />
      </div>
      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <p>&copy; {new Date().getFullYear()} AuctionsBD. All rights reserved.</p>
        <p>Built for live bidding at marketplace scale.</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4>{title}</h4>
      {links.map(([label, to]) => (
        <Link key={label} to={to}>{label}</Link>
      ))}
    </div>
  );
}
