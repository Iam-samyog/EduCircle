import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../services/auth';
import { createRoom, getRoomsByUser, getPublicRooms, joinRoom, deleteRoom } from '../services/roomService';
import { FaPlus, FaUsers, FaArrowRight, FaGlobe, FaLock, FaSearch, FaTrash, FaCompass } from 'react-icons/fa';
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
        toast.error('Failed to join');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Delete this room?')) {
      try {
        await deleteRoom(roomId);
        toast.success('Room deleted');
        setRooms(prev => prev.filter(r => r.roomId !== roomId));
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return toast.error('Enter a name');
    setCreating(true);
    try {
      const room = await createRoom(roomName, user.uid, user.displayName || 'Anonymous');
      toast.success('Room created!');
      navigate(`/room/${room.roomId}`);
    } catch (error) {
      toast.error('Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const filteredMyRooms = rooms.filter(r => r.roomName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPublicRooms = publicRooms.filter(r => r.roomName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-soft)' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              Welcome Back, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'Scholar'}</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              You have <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{rooms.length} active circles</span> today.
            </p>
          </div>
          
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
            <FaPlus /> Create New Circle
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '4rem', position: 'relative', maxWidth: '600px' }}>
          <FaSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search your circles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '3.5rem', height: '56px', fontSize: '1rem', background: 'white', borderRadius: 'var(--radius-xl)' }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '6rem 0' }}>
            <div className="spinner active" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            
            {/* My Rooms */}
            {filteredMyRooms.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <FaLock style={{ color: '#64748B' }} />
                  <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#334155' }}>Your Circles</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <FaCompass style={{ color: 'var(--color-primary)' }} />
                  <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#334155' }}>Explore Communities</h2>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
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
              <div className="card" style={{ padding: '6rem 2rem', textAlign: 'center', background: 'white' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                  {searchTerm ? `No results for "${searchTerm}"` : "Time to start your first study circle!"}
                </p>
                {!searchTerm && (
                  <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    Create Room
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card" style={{ position: 'relative', width: '100%', maxWidth: '480px', padding: '3rem', background: 'white' }}>
              <h2 style={{ marginBottom: '1rem' }}>Launch a New Circle</h2>
              <form onSubmit={handleCreateRoom}>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Room Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Final Exam Prep" 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    style={{ width: '100%' }}
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

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} roomId={selectedRoom?.roomId} roomName={selectedRoom?.roomName} />
    </div>
  );
};

const RoomCard = ({ room, user, onDelete, onShare, onJoin, onClick, isPublic, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="card"
      style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
      onClick={onClick}
    >
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1E293B' }}>{room.roomName}</h3>
          {!isPublic && room.createdBy === user?.uid && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              style={{ background: 'transparent', border: 'none', color: '#FDA4AF', cursor: 'pointer', padding: '0.25rem' }}
            >
              <FaTrash />
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaUsers style={{ color: 'var(--color-primary)' }} />
            <span>{room.participants?.length || 0} Members</span>
          </div>
          <span style={{ width: '4px', height: '4px', background: '#CBD5E1', borderRadius: '50%' }} />
          <span>{room.createdAt ? format(room.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {room.participantDetails?.slice(0, 3).map((p, i) => (
            <div key={i} style={{ 
              width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#475569'
            }}>
              {p.name?.charAt(0)}
            </div>
          ))}
          {room.participants?.length > 3 && (
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '0.5rem' }}>+{room.participants.length - 3}</span>
          )}
        </div>
      </div>

      <div style={{ 
        padding: '1.25rem 2rem', 
        background: '#F8FAFC', 
        borderTop: '1px solid #F1F5F9', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        {isPublic ? (
          <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem' }}>JOIN COMMUNITY</span>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'white' }}>
            Share Circle
          </button>
        )}
        <FaArrowRight style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
      </div>
    </motion.div>
  );
};

export default Dashboard;
