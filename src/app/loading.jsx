export default function RootLoading() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: 'var(--bg-base)', color: 'var(--text-muted)'
    }}>
      <div className="loading-spinner" />
    </div>
  );
}
