import { useState } from 'react';
import { registerUser, loginUser } from './services/api';

export default function Auth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = isRegister
        ? await registerUser({ username, email, password })
        : await loginUser({ email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onAuthSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 380, margin: '60px auto', padding: 24, border: '1px solid #333', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center' }}>{isRegister ? 'Create Account' : 'Sign In'}</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isRegister && (
          <label>
            Username:
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>
        )}

        <label>
          Email:
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <button type="submit" disabled={loading} style={{ padding: 10, marginTop: 8 }}>
          {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: 16, textAlign: 'center', cursor: 'pointer', color: '#646cff' }} onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
      </p>
    </div>
  );
}