export function NotFound() {
  if (import.meta.env.DEV) {
    console.error('Route not found:', window.location.pathname);
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
