import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaRocket, FaBrain, FaUsers, FaFileAlt, FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight, FaPlay, FaMagic } from 'react-icons/fa';

const Home = () => {
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      name: "Alex Johnson",
      role: "Medical Student",
      content: "EduCircle completely changed how I prep for anatomy. The AI flashcards are a lifesaver!",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
    {
      name: "Sarah Chen",
      role: "Computer Science Major",
      content: "The real-time collaboration is so smooth. It's like being in the same room with my study group.",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Michael Ross",
      role: "Law Student",
      content: "Summarizing 50-page readings into key points instantly? Best study tool I've ever used.",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    }
  ];

  const features = [
    {
      icon: <FaBrain />,
      title: "AI Analysis",
      description: "Automatically extract summaries and flashcards from your study materials using Google Gemini."
    },
    {
      icon: <FaUsers />,
      title: "Active Circles",
      description: "Join or create study rooms to collaborate with peers in real-time. Share notes and chat."
    },
    {
      icon: <FaRocket />,
      title: "Mastery Flow",
      description: "Smart goal tracking and progress monitoring to keep you and your group on track."
    }
  ];

  return (
    <div style={{ background: 'var(--color-bg-main)', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ 
        padding: '10rem 0 6rem 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem 1.25rem', 
                background: '#EFF6FF', 
                color: 'var(--color-primary-dark)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '2rem'
              }}>
                <FaMagic /> NEW: Gemini AI Summaries are Live
              </div>
              
              <h1 style={{ marginBottom: '1.5rem' }}>
                Study Smarter, <span className="gradient-text">Together.</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
                The all-in-one platform for collaborative learning. Join study circles, upload notes, and let AI generate your study tools instantly.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started for Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Explore Rooms
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Floating Elements */}
        <div className="floating" style={{ position: 'absolute', top: '20%', left: '5%', opacity: 0.05, fontSize: '10rem', pointerEvents: 'none' }}><FaFileAlt /></div>
        <div className="floating" style={{ position: 'absolute', bottom: '10%', right: '5%', opacity: 0.05, fontSize: '10rem', pointerEvents: 'none', animationDelay: '1s' }}><FaBrain /></div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 0', background: 'var(--color-bg-soft)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2>Built for Modern Students</h2>
            <p>Everything you need to ace your exams in one place.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: '3rem 2rem', textAlign: 'center' }}
              >
                <div style={{ 
                  width: '64px', height: '64px', background: '#EFF6FF', color: 'var(--color-primary)', 
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', margin: '0 auto 1.5rem auto'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
                <p style={{ margin: 0 }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2>Loved by Students Worldwide</h2>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReview}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card"
                style={{ padding: '4rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
              >
                <FaQuoteLeft style={{ fontSize: '2rem', color: '#DBEAFE', marginBottom: '2rem' }} />
                <p style={{ fontSize: '1.5rem', fontWeight: 500, fontStyle: 'italic', marginBottom: '2rem', color: '#1E293B' }}>
                  "{reviews[currentReview].content}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <img src={reviews[currentReview].avatar} alt={reviews[currentReview].name} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{reviews[currentReview].name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{reviews[currentReview].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button 
              onClick={() => setCurrentReview(prev => (prev === 0 ? reviews.length - 1 : prev - 1))}
              style={{ position: 'absolute', left: '-2rem', top: '50%', transform: 'translateY(-50%)' }}
              className="btn btn-secondary"
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={() => setCurrentReview(prev => (prev === reviews.length - 1 ? 0 : prev + 1))}
              style={{ position: 'absolute', right: '-2rem', top: '50%', transform: 'translateY(-50%)' }}
              className="btn btn-secondary"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ paddingBottom: '10rem' }}>
        <div className="container">
          <div className="card" style={{ 
            background: 'var(--color-primary)', 
            padding: '5rem', 
            borderRadius: '2.5rem', 
            textAlign: 'center',
            color: 'white'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Ready to elevate your grades?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', fontSize: '1.25rem' }}>Join 5,000+ students studying on EduCircle.</p>
            <Link to="/signup" className="btn btn-primary" style={{ background: 'white', color: 'var(--color-primary) !important', padding: '1.25rem 3rem' }}>
              Create Your Free Circle
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', background: 'var(--color-bg-soft)', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>EduCircle</h2>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link to="/about" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>About</Link>
              <Link to="/privacy" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Privacy</Link>
              <Link to="/terms" style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Terms</Link>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>© 2025 EduCircle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
