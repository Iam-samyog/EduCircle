import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser } from '../services/auth';
import { FaHome, FaUser, FaSignOutAlt, FaBars, FaTimes, FaCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0,
      right: 0,
      zIndex: 1000,
      height: 'var(--navbar-height)',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none'
    }}>
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-md" style={{ textDecoration: 'none' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'var(--color-primary)', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white' }}>
            EduCircle
          </h2>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden-mobile flex items-center gap-lg">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" style={navLinkStyle}>
                Dashboard
              </Link>
              <Link to="/profile" className="nav-link" style={navLinkStyle}>
                Profile
              </Link>
              <button onClick={handleSignOut} className="btn btn-secondary btn-sm" style={{ padding: '0.6rem 1.2rem' }}>
                <FaSignOutAlt /> Sign Out
              </button>
              <Link to="/profile" className="avatar-small">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" style={navLinkStyle}>Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="show-mobile" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ 
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div style={{ 
        position: 'fixed',
        top: 'var(--navbar-height)',
        left: 0,
        right: 0,
        background: 'var(--color-bg-main)',
        height: isMobileMenuOpen ? 'auto' : '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        borderBottom: isMobileMenuOpen ? '1px solid var(--glass-border)' : 'none',
        zIndex: 999
      }}>
        <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>Dashboard</Link>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>Profile</Link>
              <button onClick={handleSignOut} className="btn btn-primary" style={{ width: '100%' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={mobileLinkStyle}>Login</Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          opacity: 0.8;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          opacity: 1;
          color: var(--color-primary-light);
          text-decoration: none;
        }
        .avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
          overflow: hidden;
          transition: transform 0.2s ease;
        }
        .avatar-small:hover {
          transform: scale(1.1);
        }
        .avatar-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

const navLinkStyle = {
  cursor: 'pointer'
};

const mobileLinkStyle = {
  color: 'white',
  fontSize: '1.2rem',
  fontWeight: 600,
  textDecoration: 'none'
};

export default Navbar;
