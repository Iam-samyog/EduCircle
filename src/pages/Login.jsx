import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmail, signInWithGoogle } from '../services/auth';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../styles/components.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="card animate-slideUp" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            EduCircle
          </h1>
          <p className="text-secondary">Study together, succeed together</p>
        </div>

        <form onSubmit={handleEmailLogin}>
          <div className="input-group">
            <label className="input-label">
              <FaEnvelope style={{ display: 'inline', marginRight: '0.5rem' }} />
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaLock style={{ display: 'inline', marginRight: '0.5rem' }} />
              Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-sm"></div> : 'Sign In'}
          </button>
        </form>

        <div className="divider" style={{ margin: '1.5rem 0' }}>
          <span style={{ 
            position: 'relative', 
            top: '-0.75rem', 
            background: 'var(--color-bg-secondary)', 
            padding: '0 1rem',
            color: 'var(--color-text-muted)'
          }}>
            or
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: '1.5rem' }}
          disabled={loading}
        >
          <FaGoogle />
          Continue with Google
        </button>

        <p className="text-center text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold" style={{ color: 'var(--color-primary-light)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
