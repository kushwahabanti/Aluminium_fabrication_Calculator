'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import AppHeader from './AppHeader';

/**
 * Layout wrapper for authenticated pages.
 * Redirects to /login if user is not authenticated.
 */
export default function ProtectedLayout({ children }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', color: 'var(--text-muted)'
      }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <AppHeader />
      <main className="app-main">
        {children}
      </main>
    </>
  );
}
