import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaRocket, FaBrain, FaUsers, FaFileAlt, FaQuoteLeft, FaStar, FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaChevronLeft, FaChevronRight, FaPlay, FaSparkles } from 'react-icons/fa';

/**
 * Geometric Particle Background Component
 */
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            background: `radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const Home = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yRange = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const reviews = [
    {
      name: "Alex Johnson",
      role: "Medical Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      quote: "EduCircle transformed how my study group prepares for exams. The AI-generated flashcards save us hours of manual work!",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Computer Science Major",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      quote: "Being able to summarize complex research papers in seconds is a game-changer. The collaborative rooms feel like we're in the same library.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "High School Teacher",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      quote: "I recommend EduCircle to all my students. It's the perfect bridge between independent study and peer collaboration.",
      rating: 5
    }
  ];

  const nextReview = () => setCurrentReview((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    const timer = setInterval(nextReview, 6000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FaBrain />,
      title: "AI-Genius",
      desc: "Instant summaries and smart flashcards powered by advanced Gemini AI models.",
      color: "var(--color-primary)"
    },
    {
      icon: <FaUsers />,
      title: "Space X Collaboration",
      desc: "Join high-performance study rooms with HD chat and real-time synchronization.",
      color: "var(--color-secondary)"
    },
    {
      icon: <FaFileAlt />,
      title: "Smart Library",
      desc: "Transform messy PDFs and long documents into organized study blueprints.",
      color: "var(--color-accent)"
    }
  ];

  return (
    <div ref={containerRef} style={{ background: 'var(--color-bg-main)', color: 'white' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '0 1rem',
        overflow: 'hidden'
      }}>
        <ParticleBackground />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="glass-card"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                padding: '0.6rem 1.2rem', 
                gap: '0.8rem',
                marginBottom: '2rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-primary-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
              whileHover={{ scale: 1.05 }}
            >
              <FaSparkles /> The Future of Learning is Here
            </motion.span>

            <h1 style={{ 
              fontWeight: 800, 
              lineHeight: 0.95,
              marginBottom: '1.5rem',
              backgroundImage: 'linear-gradient(to bottom, #FFFFFF 30%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Master Your Subjects <br />
              <span style={{ color: 'var(--color-primary)', WebkitTextFillColor: 'initial' }}>With AI Power.</span>
            </h1>

            <p style={{ 
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', 
              color: 'var(--color-text-secondary)',
              maxWidth: '750px',
              margin: '0 auto 3rem',
              lineHeight: 1.7
            }}>
              Join the elite circle of learners. Collaborate in real-time, 
              automate your notes, and conquer your exams with our AI-driven study ecosystem.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>
                Join the Circle <FaRocket />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>
                Watch Demo <FaPlay style={{ fontSize: '0.8rem' }} />
              </Link>
            </div>
          </motion.div>

          {/* Floating UI Elements Mockup */}
          <motion.div 
            style={{ marginTop: '5rem', position: 'relative' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <div className="glass-card" style={{ 
              maxWidth: '900px', 
              margin: '0 auto', 
              height: '400px', 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '2rem',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
              </div>
              <div className="flex gap-lg" style={{ height: '100%' }}>
                <div className="glass-card" style={{ flex: 1, height: '80%', padding: '1rem', background: 'rgba(255,255,255,0.02)' }} />
                <div className="glass-card" style={{ flex: 2, height: '80%', padding: '1rem', background: 'rgba(255,255,255,0.02)' }} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section style={{ padding: '5rem 0', background: 'rgba(30, 41, 59, 0.5)' }}>
        <div className="container glass-card" style={{ padding: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          {[
            { label: 'Active Learners', value: '10k+' },
            { label: 'Study Rooms', value: '500+' },
            { label: 'Notes Processed', value: '1M+' },
            { label: 'AI Accuracy', value: '99%' }
          ].map((stat, i) => (
            <div key={i}>
              <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{stat.value}</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '10rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Evolve Your Learning Workflow</h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              We've built the ultimate toolset for students who refuse to settle for average. 
              Efficiency is no longer optional.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="glass-card"
                style={{ padding: '3.5rem 2.5rem', position: 'relative', overflow: 'hidden' }}
                whileHover={{ y: -10 }}
              >
                <div style={{ 
                  width: '64px', height: '64px', background: feature.color, 
                  borderRadius: '16px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', fontSize: '1.5rem', marginBottom: '2rem',
                  boxShadow: `0 0 30px ${feature.color}44`
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ marginBottom: '1rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '10rem 0', background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '320px' }}>
              <h2 style={{ marginBottom: '2rem' }}>Trusted by the World's Best Students</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                Join thousands of students from Harvard, MIT, and Oxford who are already using EduCircle to dominate their fields.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={prevReview} className="btn btn-secondary" style={{ padding: '1rem' }}><FaChevronLeft /></button>
                <button onClick={nextReview} className="btn btn-secondary" style={{ padding: '1rem' }}><FaChevronRight /></button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '320px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card"
                  style={{ padding: '3.5rem', position: 'relative' }}
                >
                  <FaQuoteLeft style={{ fontSize: '3rem', color: 'var(--color-primary)', opacity: 0.1, position: 'absolute', top: '2rem', left: '2rem' }} />
                  <p style={{ fontSize: '1.4rem', fontStyle: 'italic', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                    "{reviews[currentReview].quote}"
                  </p>
                  <div className="flex items-center gap-md">
                    <img src={reviews[currentReview].image} style={{ width: '60px', borderRadius: '50%' }} />
                    <div>
                      <h4 style={{ margin: 0 }}>{reviews[currentReview].name}</h4>
                      <p style={{ margin: 0, color: 'var(--color-primary-light)', fontSize: '0.9rem' }}>{reviews[currentReview].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '10rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{ 
            padding: '6rem 2rem', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Ready to Level Up?</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.3rem', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
              Stop studying hard, start studying smart. Join EduCircle today and experience the difference.
            </p>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ padding: '1.5rem 4rem', fontSize: '1.2rem', borderRadius: 'var(--radius-full)' }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer style={{ padding: '8rem 0 3rem', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '6rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '10px' }} />
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>EduCircle</h2>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', lineHeight: 1.8 }}>
                The premier collaborative learning platform for high-performance students. 
                Powered by innovation, designed for excellence.
              </p>
            </div>
            {['Product', 'Resources', 'Company'].map((col, i) => (
              <div key={i}>
                <h4 style={{ marginBottom: '1.5rem', color: 'white' }}>{col}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {['Link One', 'Link Two', 'Link Three'].map((link, j) => (
                    <a key={j} href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>© 2025 EduCircle. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              <a href="#" style={{ color: 'var(--color-text-muted)', fontSize: '1.5rem' }}><FaGithub /></a>
              <a href="#" style={{ color: 'var(--color-text-muted)', fontSize: '1.5rem' }}><FaTwitter /></a>
              <a href="#" style={{ color: 'var(--color-text-muted)', fontSize: '1.5rem' }}><FaLinkedin /></a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        body {
          scrollbar-gutter: stable;
        }
        @media (max-width: 768px) {
          h1 { font-size: 3rem !important; }
          section { padding: 6rem 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
