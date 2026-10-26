/**
 * LoadingSkeleton — Reusable skeleton loading components.
 * Used in loading.jsx files for each route.
 */

export function CardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card animate-in" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '24px',
          animationDelay: `${i * 100}ms`
        }}>
          <div className="skeleton-line" style={{ width: '40%', height: '16px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ width: '70%', height: '12px', marginBottom: '8px' }} />
          <div className="skeleton-line" style={{ width: '55%', height: '12px' }} />
        </div>
      ))}
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="calc-page">
      <aside className="calc-sidebar">
        <div className="sidebar-card">
          <div className="skeleton-line" style={{ width: '60%', height: '16px', marginBottom: '16px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '40px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '40px', marginBottom: '12px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '40px' }} />
        </div>
      </aside>
      <div className="calc-results">
        <div className="empty-state">
          <div className="skeleton-line" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
          <div className="skeleton-line" style={{ width: '200px', height: '20px', marginTop: '16px' }} />
          <div className="skeleton-line" style={{ width: '300px', height: '14px', marginTop: '8px' }} />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div className="skeleton-line" style={{ width: '200px', height: '24px', marginBottom: '24px' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: '16px', padding: '12px 0',
          borderBottom: '1px solid var(--border)',
          animationDelay: `${i * 50}ms`
        }} className="animate-in">
          <div className="skeleton-line" style={{ width: '30%', height: '14px' }} />
          <div className="skeleton-line" style={{ width: '20%', height: '14px' }} />
          <div className="skeleton-line" style={{ width: '25%', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}
