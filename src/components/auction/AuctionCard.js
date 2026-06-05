import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCountdown } from '../../hooks/useCountdown';

function splitCountdown(format) {
  const raw = format();
  const parts = raw.match(/\d+/g) || ['0', '0', '0'];
  return {
    days: parts[0] || '0',
    hours: parts[1] || '0',
    minutes: parts[2] || '0',
  };
}

function AuctionCard({ auction }) {
  const { format, isExpired } = useCountdown(auction.endTime, { tickMs: 60000 });
  const primaryImage = auction.images?.find(image => image.isPrimary) || auction.images?.[0];
  const time = splitCountdown(format);
  const title = auction.title || 'Auction item';
  const year = auction.createdAt ? new Date(auction.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <Link to={`/auctions/${auction._id}`} className="auction-card">
      <article className="auction-card-shell">
        <div className="auction-image">
          {primaryImage?.url ? (
            <img src={primaryImage.url} alt={title} loading="lazy" decoding="async" />
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#777', fontWeight: 900 }}>
              No Image
            </div>
          )}
          {auction.isFeatured && <span className="card-badge">Featured</span>}
          <span className="heart" aria-hidden="true">{'\u2665'}</span>
        </div>

        <div className="auction-body">
          <div className="auction-title-row">
            <div>
              <h3>{title}</h3>
              <p className="auction-meta">{year}{' \u00b7 '}{auction.condition || 'Good'}</p>
            </div>
          </div>

          <div className="auction-bottom">
            <div>
              <span className="price-label">{auction.totalBids ? 'Current Bid' : 'Starting Bid'}</span>
              <strong className="price">${Number(auction.currentPrice || 0).toLocaleString()}</strong>
              <span className="auction-meta">{auction.category || 'Auction'}{' \u00b7 '}{auction.seller?.name || 'Verified seller'}</span>
            </div>

            <div>
              <span className="timer-label">{isExpired ? 'Ended' : 'Bid Ends In'}</span>
              <div className="timer">
                <span>{time.days.padStart(2, '0')}<small>Days</small></span>
                <span>{time.hours.padStart(2, '0')}<small>Hours</small></span>
                <span>{time.minutes.padStart(2, '0')}<small>Min</small></span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default memo(AuctionCard);
