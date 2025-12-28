import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { FaRocket, FaBrain, FaUsers, FaFileAlt, FaQuoteLeft, FaStar, FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Home = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const reviews = [
    {
      name: "Alex Johnson",
      role: "Medical Student",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      quote: "EduCircle transformed how my study group prepares for exams. The flashcard system makes reviewing so much more efficient!",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Computer Science Major",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      quote: "Being able to organize complex research papers is a game-changer. The collaborative rooms feel like we're in the same library.",
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
    const timer = setInterval(nextReview, 5000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const features = [
    {
      icon: <FaBrain />,
      title: "Active Learning",
      desc: "Create and organize your own flashcards and study materials manually for better retention."
    },
    {
      icon: <FaUsers />,
      title: "Real-time Study",
      desc: "Chat, collaborate, and study together in virtual rooms with zero latency."
    },
    {
      icon: <FaFileAlt />,
      title: "Smart Notes",
      desc: "Upload PDFs or Docs and organize them into structured study materials for your group."
    }
  ];

  // Bouncing circles data
  const circles = [
    { size: 300, color: 'rgba(37, 99, 235, 0.1)', top: '10%', left: '5%', delay: 0, duration: 20 },
    { size: 400, color: 'rgba(59, 130, 246, 0.08)', top: '40%', left: '75%', delay: 2, duration: 25 },
    { size: 250, color: 'rgba(96, 165, 250, 0.12)', top: '70%', left: '15%', delay: 5, duration: 18 },
    { size: 350, color: 'rgba(147, 197, 253, 0.1)', top: '20%', left: '60%', delay: 8, duration: 22 }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section" style={{ 
        position: 'relative',
        padding: '8rem 2rem', 
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
        overflow: 'hidden'
      }}>
        {/* Animated Background Circles */}
        {circles.map((circle, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: circle.duration,
              repeat: Infinity,
              delay: circle.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              width: circle.size,
              height: circle.size,
              borderRadius: '50%',
              background: circle.color,
              filter: 'blur(60px)',
              top: circle.top,
              left: circle.left,
              zIndex: 0
            }}
          />
        ))}

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
          

            <motion.h1 
              variants={itemVariants}
              className="gradient-text"
              style={{ 
                fontSize: 'clamp(3rem, 10vw, 5.5rem)', 
                fontWeight: 800,
                lineHeight: 1.05,
                marginBottom: '1.5rem',
                letterSpacing: '-0.04em'
              }}
            >
              Study Together,<br />
              Succeed Together
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-muted"
              style={{ 
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
                maxWidth: '700px', 
                margin: '0 auto 3rem',
                lineHeight: 1.6
              }}
            >
              The all-in-one collaborative learning platform. 
              Chat, share notes, and quiz yourself with custom flashcards.
            </motion.p>

            <motion.div variants={itemVariants} className="hero-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
              <Link to="/signup" className="btn btn-primary btn-lg shine-effect" style={{ width: 'auto', padding: '1.25rem 2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' }}>
                Start Studying Free
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg" style={{ width: 'auto', padding: '1.25rem 2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)' }}>
                Log In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '6rem 2rem', background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Modern Tools for Modern Students</h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>Everything you need to master your subjects faster and better than ever before.</p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card card-hover"
                style={{
                  padding: '3rem 2rem',
                  borderRadius: 'var(--radius-2xl)',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ 
                  width: '70px',
                  height: '70px',
                  borderRadius: '20px',
                  background: 'white',
                  color: 'var(--color-primary)', 
                  fontSize: '2rem', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600 }}>{feature.title}</h3>
                <p className="text-muted" style={{ lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section style={{ padding: '6rem 2rem', background: '#F1F5F9' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Loved by Students Everywhere</h2>
          </div>
          
          <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentReview}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card"
                style={{
                  padding: '4rem 3rem',
                  textAlign: 'center',
                  background: 'white',
                  borderRadius: 'var(--radius-2xl)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
                }}
              >
                <FaQuoteLeft style={{ fontSize: '3rem', color: 'var(--color-primary)', opacity: 0.1, position: 'absolute', top: '2rem', left: '2rem' }} />
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
                  {[...Array(reviews[currentReview].rating)].map((_, i) => (
                    <FaStar key={i} style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                
                <p style={{ fontSize: '1.5rem', fontWeight: 500, fontStyle: 'italic', marginBottom: '2.5rem', color: 'var(--color-text-primary)' }}>
                  "{reviews[currentReview].quote}"
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <img src={reviews[currentReview].image} alt={reviews[currentReview].name} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E2E8F0' }} />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{reviews[currentReview].name}</h4>
                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>{reviews[currentReview].role}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={prevReview} className="btn btn-secondary" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }}>
                <FaChevronLeft />
              </button>
              <button onClick={nextReview} className="btn btn-secondary" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }}>
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Amazing Footer */}
      <footer style={{ 
        padding: '5rem 2rem 2rem', 
        background: '#0F172A',
        color: 'white'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '4rem',
            marginBottom: '4rem'
          }}>
            <div style={{ gridColumn: 'span 2' }}>
              <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '1.5rem' }}>EduCircle</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', lineHeight: 1.7 }}>
                Revolutionizing how students collaborate and study. Join thousands of learners mastering their subjects with real-time collaboration.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.5rem' }}><FaGithub /></a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.5rem' }}><FaTwitter /></a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.5rem' }}><FaLinkedin /></a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.5rem' }}><FaEnvelope /></a>
              </div>
            </div>
            
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Browse Rooms', 'Notes', 'Flashcards', 'Rewards'].map(item => (
                  <li key={item} style={{ marginBottom: '1rem' }}>
                    <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 400 }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['Help Center', 'Safety Center', 'Community Guidelines', 'Contact Us'].map(item => (
                  <li key={item} style={{ marginBottom: '1rem' }}>
                    <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 400 }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div style={{ 
            paddingTop: '2rem', 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>© 2025 EduCircle. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            padding: 6rem 1rem !important;
          }
          .hero-buttons {
            flex-direction: column !important;
            align-items: center !important;
          }
          .hero-buttons > a {
            width: 100% !important;
            max-width: 320px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
