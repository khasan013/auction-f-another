import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="app-page" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', paddingLeft: 20, paddingRight: 20 }}>
      <div>
        <div style={{ color: 'rgba(255,212,0,0.18)', fontSize: 'clamp(110px, 22vw, 210px)', fontWeight: 900, lineHeight: 0.9 }}>404</div>
        <h1 className="app-title" style={{ marginBottom: 12 }}>Page Not Found</h1>
        <p className="app-muted" style={{ maxWidth: 420, margin: '0 auto 28px' }}>The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
