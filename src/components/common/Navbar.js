import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { getSocket } from '../../services/socket';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let socket;
    userAPI.getNotifications({ unreadOnly: true })
      .then(res => setUnreadCount(res.unreadCount || 0))
      .catch(() => {});

    socket = getSocket();
    if (socket) {
      const bump = () => setUnreadCount(prev => prev + 1);
      socket.on('outbid', bump);
      socket.on('auctionEnded', bump);
      socket.on('newBidOnYourAuction', bump);
      return () => {
        socket.off('outbid', bump);
        socket.off('auctionEnded', bump);
        socket.off('newBidOnYourAuction', bump);
      };
    }
    return undefined;
  }, [user]);

  useEffect(() => {
    const handler = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/auctions', label: 'Market' },
    { to: '/auctions/create', label: 'Post' },
    { to: '/dashboard?tab=bids', label: 'Your Bidding' },
    { to: '/dashboard?tab=transactions', label: 'Transaction' },
  ];

  const isActive = (to) => {
    const [path] = to.split('?');
    return path === '/' ? location.pathname === '/' : location.pathname === path;
  };

  return (
    <>
      <div className="top-strip">
        We will help you sell or buy and bid your dream item easily, quickly, and reliably
      </div>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="brand" aria-label="AuctionsBD home">
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

          <nav className="nav-links" aria-label="Primary">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link${isActive(link.to) ? ' active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <Link to="/auctions?category=Vehicles" className="nav-chip">
              <LocationIcon />
              Bangladesh
            </Link>

            <button
              type="button"
              className="icon-btn mobile-menu-btn"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(open => !open)}
            >
              <MenuIcon />
            </button>

            {user ? (
              <>
                <Link to="/dashboard?tab=notifications" className="icon-btn" aria-label="Notifications">
                  <MessageIcon />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>
                <Link to="/dashboard?tab=watchlist" className="icon-btn" aria-label="Watchlist">
                  <HeartIcon />
                </Link>
                <div ref={profileRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className="avatar-btn"
                    onClick={() => setProfileOpen(open => !open)}
                    aria-expanded={profileOpen}
                  >
                    <span>{user.name?.split(' ')[0]}</span>
                    <span className="avatar-circle">
                      {user.avatar?.url ? <img src={user.avatar.url} alt="" /> : user.name?.[0]?.toUpperCase()}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="profile-menu">
                      <div style={{ padding: '10px 12px 8px' }}>
                        <strong style={{ color: '#050505' }}>{user.name}</strong>
                        <p style={{ color: '#777', fontSize: 12, marginTop: 2 }}>{user.email}</p>
                      </div>
                      <Link to="/dashboard">Dashboard</Link>
                      <Link to="/dashboard?tab=bids">My Bids</Link>
                      <Link to="/dashboard?tab=listings">My Listings</Link>
                      <Link to="/profile">Settings</Link>
                      {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
                      <button type="button" onClick={handleLogout}>Log Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Log In</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="container mobile-menu-panel">
            <nav className="mobile-menu-links">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="btn-secondary">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

const LocationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const MessageIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21s-7.8-4.7-10.2-9.3C-.1 8 1.7 4 5.5 3.3 7.7 2.8 10 4 12 6.2 14 4 16.3 2.8 18.5 3.3c3.8.7 5.6 4.7 3.7 8.4C19.8 16.3 12 21 12 21z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
