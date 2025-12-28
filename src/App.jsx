import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './styles/index.css';
import './styles/components.css';

function App() {
  return (
    <AuthProvider>
      <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'blur(10px)'
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'white'
            }
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'white'
            }
          }
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
