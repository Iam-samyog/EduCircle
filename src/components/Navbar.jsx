import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, getCurrentUser } from '../services/auth';
import { FaHome, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000,
      padding: '0.75rem 0',
      background: 'black',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div className="container flex items-center justify-between nav-container">
        <Link to="/" className="flex items-center gap-md" style={{ textDecoration: 'none' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-serif)', color: 'white' }}>
            EduCircle
          </h2>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden-mobile flex items-center gap-md">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-sm" style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                <FaHome />
                Dashboard
              </Link>

              <button onClick={() => setIsConfirmOpen(true)} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
                <FaSignOutAlt />
                Sign Out
              </button>

              <Link to="/profile" className="avatar avatar-sm" style={{ borderColor: 'white', textDecoration: 'none', cursor: 'pointer' }} title="View Profile">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm" style={{ background: 'transparent', color: 'white', border: 'none', fontWeight: 500 }}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-sm" style={{ background: 'white', color: 'black', border: 'none', fontWeight: 600 }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="show-mobile hamburger-btn" 
          onClick={toggleMobileMenu}
          style={{ 
            position: 'fixed',
            top: '0.75rem',
            right: '1rem',
            width: '3rem',
            height: '3rem',
            zIndex: 1001
          }}
        >
          {isMobileMenuOpen ? <FaTimes style={{ fontSize: '1.2rem' }} /> : <FaBars style={{ fontSize: '1.2rem' }} />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={toggleMobileMenu}
          style={{ 
            position: 'fixed', 
            top: '64px', 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }} 
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '64px', 
          right: isMobileMenuOpen ? 0 : '-280px', 
          width: '280px', 
          height: 'calc(100vh - 64px)', 
          background: 'black', 
          zIndex: 1000, 
          transition: 'right 0.3s ease',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Link to="/profile" className="avatar avatar-md" style={{ textDecoration: 'none' }} onClick={toggleMobileMenu}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </Link>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{user.displayName || 'Student'}</p>
                <Link to="/profile" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }} onClick={toggleMobileMenu}>View Profile</Link>
              </div>
            </div>

            <Link to="/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} onClick={toggleMobileMenu}>
              <FaHome /> Dashboard
            </Link>

            <button onClick={() => { setIsConfirmOpen(true); setIsMobileMenuOpen(false); }} className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              <FaSignOutAlt /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary" onClick={toggleMobileMenu}>Login</Link>
            <Link to="/signup" className="btn btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} onClick={toggleMobileMenu}>Get Started</Link>
          </>
        )}
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out?"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        type="warning"
      />

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .show-mobile {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
