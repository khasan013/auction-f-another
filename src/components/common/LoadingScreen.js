import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="app-page" style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 22 }}>
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div className="brand-copy"><strong>AuctionsBD</strong><small>Live Online Auctions</small></div>
        </div>
        <div className="spin" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );
}
