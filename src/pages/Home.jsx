import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaRocket, FaBrain, FaUsers, FaFileAlt } from 'react-icons/fa';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const features = [
    {
      icon: <FaBrain />,
      title: "AI-Powered",
      desc: "Summarize notes and generate flashcards instantly with Google Gemini AI."
    },
    {
      icon: <FaUsers />,
      title: "Real-time Study",
      desc: "Chat, collaborate, and study together in virtual rooms with zero latency."
    },
    {
      icon: <FaFileAlt />,
      title: "Smart Notes",
      desc: "Upload PDFs or Docs and let our AI transform them into study materials."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section" style={{ 
        padding: '6rem 2rem', 
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 60%)'
      }}>
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                <FaRocket style={{ marginRight: '0.5rem' }} /> v1.0 Now Live
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="gradient-text"
              style={{ 
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em'
              }}
            >
              Study Together,<br />
              Succeed Together
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-muted"
              style={{ 
                fontSize: 'clamp(1.1rem, 3vw, 1.25rem)', 
                maxWidth: '600px', 
                margin: '0 auto 2.5rem' 
              }}
            >
              The all-in-one collaborative learning platform powered by AI. 
              Chat, share notes, and quiz yourself with flashcards generated in seconds.
            </motion.p>

            <motion.div variants={itemVariants} className="hero-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/signup" className="btn btn-primary btn-lg shine-effect" style={{ width: 'auto' }}>
                Start Studying Free
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg" style={{ width: 'auto' }}>
                Log In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 2rem' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass card-hover"
                style={{
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)'
                }}
              >
                <div style={{ 
                  color: 'var(--color-primary)', 
                  fontSize: '2rem', 
                  marginBottom: '1rem' 
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p className="text-muted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            padding: 4rem 1rem !important;
          }
          .hero-buttons {
            flex-direction: column !important;
            align-items: center !important;
          }
          .hero-buttons > a {
            width: 100% !important;
            max-width: 300px;
          }
        }
      `}</style>

      {/* Tech Stack Ticker */}
      <section style={{ 
        padding: '2rem 0', 
        borderTop: '1px solid var(--glass-border)',
        overflow: 'hidden'
      }}>
        <p className="text-center text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          POWERED BY MODERN TECH
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '3rem', 
          flexWrap: 'wrap',
          opacity: 0.7 
        }}>
          {['React 19', 'Firebase', 'Google Gemini', 'Vite', 'Python'].map((tech) => (
            <span key={tech} style={{ fontWeight: 600, fontSize: '1.1rem' }}>{tech}</span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        borderTop: '1px solid var(--glass-border)',
        marginTop: '2rem'
      }}>
        <p className="text-muted">© 2025 EduCircle. Built with ❤️ for students.</p>
      </footer>
    </div>
  );
};

export default Home;
