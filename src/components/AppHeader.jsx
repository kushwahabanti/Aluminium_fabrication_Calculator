'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

/** Navigation link items */
const NAV_LINKS = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/projects',   label: 'Saved Projects' },
  { href: '/reports',    label: 'Financial Reports' },
  { href: '/profile',    label: 'Settings' },
];

/** App header with navigation and user info. Only shown when authenticated. */
export default function AppHeader() {
  const { user, logout } = useContext(AuthContext);
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7L12 3L20 7V17L12 21L4 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M4 7L12 11L20 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 11V21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="brand-title">AluminiumCalc</h1>
          <span className="brand-sub">Fabrication Calculator</span>
        </div>
      </div>

      <nav className="header-nav">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
            background: 'var(--surface-dark)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Hi, {user.name.split(' ')[0]}
          </span>
        </Link>
        <button
          onClick={logout}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-primary)', padding: '4px 12px',
            borderRadius: '4px', cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
