import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../services/auth';
import { createRoom, getRoomsByUser, generateRoomLink, getPublicRooms, requestJoin, joinRoom, deleteRoom } from '../services/roomService';
import { FaPlus, FaUsers, FaCopy, FaArrowRight, FaGlobe, FaLock, FaSearch, FaTrash, FaCompass } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ShareModal from '../components/ShareModal';
import { format } from 'date-fns';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const userRooms = await getRoomsByUser(user.uid);
      setRooms(userRooms);
      
      try {
          const allPublicRooms = await getPublicRooms();
          const newPublicRooms = allPublicRooms.filter(
            r => !r.participants?.includes(user.uid)
          );
          setPublicRooms(newPublicRooms);
      } catch (pubError) {
          console.error('Error loading public rooms:', pubError);
      }
    } catch (error) {
      console.error('Error loading user rooms:', error);
      toast.error('Failed to load your rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
        await joinRoom(roomId, user.uid, user.displayName || 'Anonymous');
        toast.success('Joined room!');
        navigate(`/room/${roomId}`);
    } catch(error) {
        console.error(error);
        toast.error('Failed to join');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Delete this room permanently? This cannot be undone.')) {
      try {
        await deleteRoom(roomId);
        toast.success('Room deleted');
        setRooms(prev => prev.filter(r => r.roomId !== roomId));
      } catch (error) {
        toast.error('Failed to delete room');
      }
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return toast.error('Enter a room name');
    setCreating(true);
    try {
      const room = await createRoom(roomName, user.uid, user.displayName || 'Anonymous');
      toast.success('Room created!');
      navigate(`/room/${room.roomId}`);
    } catch (error) {
      toast.error('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const filteredMyRooms = rooms.filter(r => r.roomName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPublicRooms = publicRooms.filter(r => r.roomName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--navbar-height)' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', gap: '2rem', flexWrap: 'wrap' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 style={{ marginBottom: '0.5rem' }}>
              Welcome back, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Scholar'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem' }}>
              You have {rooms.length} active study rooms today.
            </p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ padding: '1rem 2rem' }}
          >
            <FaPlus /> Create New Room
          </motion.button>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '5rem', position: 'relative' }}
        >
          <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--glass-border)' }}>
            <FaSearch style={{ marginLeft: '1.5rem', color: 'var(--color-primary)', opacity: 0.6 }} />
            <input 
              type="text" 
              placeholder="Search your rooms or explore new ones..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '1rem',
                fontSize: '1.1rem',
                color: 'white',
                boxShadow: 'none'
              }}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '10rem 0' }}>
            <div className="spinner active" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
            
            {/* User's Rooms */}
            {filteredMyRooms.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <FaLock style={{ color: 'var(--color-primary)' }} />
                  <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Your Private Circles</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                  {filteredMyRooms.map((room, i) => (
                    <RoomCard 
                      key={room.roomId} 
                      room={room} 
                      user={user} 
                      onDelete={() => handleDeleteRoom(room.roomId)}
                      onShare={() => { setSelectedRoom(room); setShowShareModal(true); }}
                      onClick={() => navigate(`/room/${room.roomId}`)}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Public Rooms */}
            {filteredPublicRooms.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  <FaCompass style={{ color: 'var(--color-secondary)' }} />
                  <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Explore Public Circles</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                  {filteredPublicRooms.map((room, i) => (
                    <RoomCard 
                      key={room.roomId} 
                      room={room} 
                      isPublic
                      onJoin={() => handleJoinRoom(room.roomId)}
                      onClick={() => handleJoinRoom(room.roomId)}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredMyRooms.length === 0 && filteredPublicRooms.length === 0 && (
              <div className="glass-card" style={{ padding: '6rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                  {searchTerm ? `No rooms found for "${searchTerm}"` : "You haven't joined any rooms yet."}
                </p>
                {!searchTerm && (
                  <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    Create Your First Room
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card" 
              style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '3rem', background: 'var(--color-bg-card)' }}
            >
              <h2 style={{ marginBottom: '1.5rem' }}>Create Study Room</h2>
              <form onSubmit={handleCreateRoom}>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Room Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Quantum Physics Prep" 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{ width: '100%', padding: '1rem' }}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={creating}>
                    {creating ? 'Creating...' : 'Launch Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomId={selectedRoom?.roomId}
        roomName={selectedRoom?.roomName}
      />
    </div>
  );
};

const RoomCard = ({ room, user, onDelete, onShare, onJoin, onClick, isPublic, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="glass-card"
      style={{ cursor: 'pointer', overflow: 'hidden' }}
      onClick={onClick}
    >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{room.roomName}</h3>
          {!isPublic && room.createdBy === user?.uid && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', opacity: 0.6, cursor: 'pointer' }}
              title="Delete Room"
            >
              <FaTrash />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-md" style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          <FaUsers style={{ color: 'var(--color-primary)' }} />
          <span>{room.participants?.length || 0} Members</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>{room.createdAt ? format(room.createdAt.toDate(), 'MMM d') : 'New'}</span>
        </div>

        <div className="flex items-center gap-sm">
          {room.participantDetails?.slice(0, 4).map((p, i) => (
            <div key={i} style={{ 
              width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', 
              border: '2px solid var(--color-bg-card)', marginLeft: i > 0 ? '-12px' : 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700
            }}>
              {p.name?.charAt(0)}
            </div>
          ))}
          {room.participants?.length > 4 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
              +{room.participants.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '1.25rem 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isPublic ? (
          <span style={{ color: 'var(--color-secondary)', fontWeight: 700, fontSize: '0.9rem' }}>JOIN CIRCLE</span>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <FaCopy /> Share
          </button>
        )}
        <div style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}><FaArrowRight /></div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
