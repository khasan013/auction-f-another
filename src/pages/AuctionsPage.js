import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auctionAPI } from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Collectibles', 'Art', 'Jewelry',
  'Vehicles', 'Home & Garden', 'Sports', 'Toys', 'Books',
  'Music', 'Gaming', 'Health & Beauty', 'Business', 'Other',
];
const CONDITIONS = ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'];
const LIMIT = 12;

export default function AuctionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debounceRef = useRef(null);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || '-createdAt',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  const setFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, String(value));
      else next.delete(key);
      if (key !== 'page') next.set('page', '1');
      return next;
    });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setFilter('search', value), 350);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: LIMIT };
      if (!params.status) delete params.status;
      const res = await auctionAPI.getAll(params);
      setAuctions(res.auctions || []);
      setPagination(res.pagination || { page: 1, total: 0, pages: 1 });
    } catch {
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams.toString()]);

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.isFeatured,
    filters.status,
  ].filter(Boolean).length;

  const pageNumbers = getPageNumbers(pagination.pages, pagination.page);

  return (
    <div className="auctions-page">
      <div className="container-wide">
        <div className="results-top">
          <div>
            <p style={{ color: '#8b8b84', fontWeight: 900, marginBottom: 4 }}>Live Marketplace</p>
            <h1>{filters.category || 'All Auctions'}</h1>
            {!loading && <p style={{ color: '#74746d', fontWeight: 700 }}>{pagination.total.toLocaleString()} items found</p>}
          </div>
          <button type="button" className="btn-primary" onClick={clearAllFilters}>
            Reset
          </button>
        </div>

        <div className="listing-search">
          <SearchIcon />
          <input
            placeholder="Search auction, model, category, or keyword"
            value={searchInput}
            onChange={handleSearchChange}
          />
          {searchInput && (
            <button type="button" className="btn-ghost" onClick={() => { setSearchInput(''); setFilter('search', ''); }}>
              Clear
            </button>
          )}
        </div>

        <div className="auctions-layout">
          <aside className="filter-rail">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ fontSize: 22 }}>Filters</h2>
              {activeFilterCount > 0 && <span className="badge badge-scheduled">{activeFilterCount}</span>}
            </div>

            <FilterSelect label="Location" value="Bangladesh" disabled options={['Bangladesh']} />
            <FilterSelect label="Brands / Category" value={filters.category} onChange={value => setFilter('category', value)} options={['All Categories', ...CATEGORIES]} />
            <FilterSelect label="Type / Condition" value={filters.condition} onChange={value => setFilter('condition', value)} options={['Any Condition', ...CONDITIONS]} />
            <FilterSelect label="Auction Status" value={filters.status} onChange={value => setFilter('status', value)} options={['All Live & Upcoming', 'active', 'scheduled', 'ended', 'sold']} />
            <FilterSelect label="Sort" value={filters.sort} onChange={value => setFilter('sort', value)} options={['-createdAt', 'endTime', '-currentPrice', 'currentPrice', '-totalBids', '-watchCount']} labels={{
              '-createdAt': 'Newest First',
              endTime: 'Ending Soonest',
              '-currentPrice': 'Price High to Low',
              currentPrice: 'Price Low to High',
              '-totalBids': 'Most Bids',
              '-watchCount': 'Most Watched',
            }} />

            <div className="filter-group">
              <label className="filter-label">Price Range</label>
              <div style={{ display: 'grid', gap: 8 }}>
                <input className="filter-input" type="number" min="0" placeholder="Minimum Price" value={filters.minPrice} onChange={event => setFilter('minPrice', event.target.value)} />
                <input className="filter-input" type="number" min="0" placeholder="Maximum Price" value={filters.maxPrice} onChange={event => setFilter('maxPrice', event.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={filters.isFeatured === 'true'}
                  onChange={event => setFilter('isFeatured', event.target.checked ? 'true' : '')}
                />
                Featured only
              </label>
            </div>
          </aside>

          <main>
            {loading ? (
              <div style={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
                <div className="spin" />
              </div>
            ) : auctions.length === 0 ? (
              <div style={{ minHeight: 320, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 30, marginBottom: 8 }}>No auctions found</h2>
                  <p style={{ color: '#777', fontWeight: 700, marginBottom: 18 }}>Try a different keyword or reset the filters.</p>
                  <button type="button" className="btn-primary" onClick={clearAllFilters}>Reset Filters</button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid-auto">
                  {auctions.map(auction => <AuctionCard key={auction._id} auction={auction} />)}
                </div>

                {pagination.pages > 1 && (
                  <div className="page-controls">
                    <button type="button" onClick={() => setFilter('page', filters.page - 1)} disabled={filters.page <= 1}>Prev</button>
                    {pageNumbers.map(page => (
                      <button
                        key={page}
                        type="button"
                        className={page === filters.page ? 'active' : ''}
                        onClick={() => setFilter('page', page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button type="button" onClick={() => setFilter('page', filters.page + 1)} disabled={filters.page >= pagination.pages}>Next</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, labels = {}, disabled = false }) {
  return (
    <div className="filter-group">
      <label className="filter-label">{label}</label>
      <select
        className="filter-input"
        value={value}
        disabled={disabled}
        onChange={event => onChange?.(normalizeSelectValue(event.target.value))}
      >
        {options.map(option => {
          const normalized = normalizeSelectValue(option);
          return <option key={option} value={normalized}>{labels[option] || option}</option>;
        })}
      </select>
    </div>
  );
}

function normalizeSelectValue(value) {
  if (value === 'All Categories' || value === 'Any Condition' || value === 'All Live & Upcoming') return '';
  return value;
}

function getPageNumbers(total, current) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  return [...new Set([1, total, current - 1, current, current + 1])]
    .filter(page => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="7" />
    <path d="m16 16 5 5" />
  </svg>
);
