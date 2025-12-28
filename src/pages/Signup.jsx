import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpWithEmail, signInWithGoogle } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { FaGoogle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../styles/components.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { strength: 0, label: '', color: '' };
    if (pass.length < 6) return { strength: 25, label: 'Weak', color: 'var(--color-error)' };
    if (pass.length < 10) return { strength: 50, label: 'Fair', color: 'var(--color-warning)' };
    if (pass.length < 14) return { strength: 75, label: 'Good', color: 'var(--color-primary)' };
    return { strength: 100, label: 'Strong', color: 'var(--color-success)' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error('Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="card animate-slideUp" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Join EduCircle
          </h1>
          <p className="text-secondary">Create your account and start studying</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label className="input-label">
              <FaUser style={{ display: 'inline', marginRight: '0.5rem' }} />
              Full Name
            </label>
            <input
              type="text"
              className="input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

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
            {password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${passwordStrength.strength}%`, background: passwordStrength.color }}
                  ></div>
                </div>
                <p className="text-sm" style={{ marginTop: '0.25rem', color: passwordStrength.color }}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FaLock style={{ display: 'inline', marginRight: '0.5rem' }} />
              Confirm Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? <div className="spinner spinner-sm"></div> : 'Create Account'}
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
          onClick={handleGoogleSignup}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: '1.5rem' }}
          disabled={loading}
        >
          <FaGoogle />
          Continue with Google
        </button>

        <p className="text-center text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary-light)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
