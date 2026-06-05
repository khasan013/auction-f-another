import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auctionAPI } from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';

const CATEGORIES = [
  'Vehicles',
  'Electronics',
  'Jewelry',
  'Art',
  'Collectibles',
  'Fashion',
  'Gaming',
  'Business',
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [ending, setEnding] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      auctionAPI.getAll({ isFeatured: true, status: 'active', limit: 4 }),
      auctionAPI.getAll({ status: 'active', sort: 'endTime', limit: 4 }),
    ])
      .then(([featuredRes, endingRes]) => {
        if (!active) return;
        setFeatured(featuredRes?.auctions || featuredRes || []);
        setEnding(endingRes?.auctions || endingRes || []);
      })
      .catch(() => {
        if (!active) return;
        setFeatured([]);
        setEnding([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/auctions?search=${encodeURIComponent(query)}` : '/auctions');
  };

  return (
    <div className="home-dark">
      <section className="hero">
        <div className="container hero-content">
          <form className="hero-search animate-rise" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search auction, model, category, or keyword"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />
            <button type="submit" aria-label="Search">
              <SearchIcon />
            </button>
          </form>

          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.5 }}>
            <p className="eyebrow">Best Auction Marketplace</p>
            <h1 className="hero-title">Find & Sell Your Best Item Easily & Trusted</h1>
          </motion.div>

          <motion.div
            className="hero-side-copy"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
          >
            <p>Sell, buy, and bid with real-time auction updates, trusted sellers, secure checkout, and a fast marketplace experience.</p>
            <Link to="/auctions" className="btn-primary hero-cta">Browse Auctions</Link>
          </motion.div>

          <div className="slider-dots" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="hero-stats">
            {[
              ['1M+', 'Concurrent-ready UI'],
              ['24/7', 'Live bidding'],
              ['15+', 'Auction categories'],
            ].map(([value, label], index) => (
              <motion.div
                key={label}
                className="hero-stat"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + index * 0.08 }}
              >
                <strong>{value}</strong>
                <span>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="market-section dark">
        <div className="container">
          <SectionHead title="Popular Categories" subtitle="Jump into the busiest bidding lanes." link="/auctions" />
          <div className="category-grid">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category}
                to={`/auctions?category=${encodeURIComponent(category)}`}
                className="category-tile animate-float"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{category}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="market-section">
          <div className="container">
            <SectionHead title="Featured Auctions" subtitle="Verified listings with strong bidding activity." link="/auctions?isFeatured=true" />
            <div className="grid-auto">
              {featured.map(auction => <AuctionCard key={auction._id} auction={auction} />)}
            </div>
          </div>
        </section>
      )}

      {ending.length > 0 && (
        <section className="market-section dark">
          <div className="container">
            <SectionHead title="Bid Ending Soon" subtitle="Last-call auctions that are moving now." link="/auctions?sort=endTime" dark />
            <div className="grid-auto">
              {ending.map(auction => <AuctionCard key={auction._id} auction={auction} />)}
            </div>
          </div>
        </section>
      )}

      <section className="market-section">
        <div className="container sell-cta">
          <div>
            <p style={{ color: '#777', fontWeight: 800, marginBottom: 6 }}>Ready to sell?</p>
            <h2 style={{ fontSize: 'clamp(30px, 5vw, 54px)', lineHeight: 1.05 }}>Post an auction and let buyers compete.</h2>
          </div>
          <Link to="/auctions/create" className="btn-primary">Post Auction</Link>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, subtitle, link }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {link && <Link to={link} className="section-link">View all</Link>}
    </div>
  );
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 5 5" />
  </svg>
);
