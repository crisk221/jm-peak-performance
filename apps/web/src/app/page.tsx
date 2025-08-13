export default async function Home() {
  // Simple test page without redirects
  return (
    <div style={{ padding: '20px' }}>
      <h1>JM Peak Performance</h1>
      <p>Welcome to the Nutrition Coaching Platform</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/sign-in" style={{ marginRight: '10px', color: 'blue' }}>Sign In</a>
        <a href="/sign-up" style={{ color: 'blue' }}>Sign Up</a>
      </div>
    </div>
  );
}
