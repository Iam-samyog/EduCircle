import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { createRoom, getRoomsByUser, generateRoomLink, getPublicRooms, requestJoin, joinRoom, deleteRoom } from '../services/roomService';
import { FaPlus, FaUsers, FaCopy, FaArrowRight, FaGlobe, FaLock, FaSearch, FaTrash } from 'react-icons/fa';
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
      // 1. Load User Rooms (Critical)
      const userRooms = await getRoomsByUser(user.uid);
      setRooms(userRooms);
      
      // 2. Load Public Rooms (Optional - fail gracefully)
      try {
          const allPublicRooms = await getPublicRooms();
          const newPublicRooms = allPublicRooms.filter(
            r => !r.participants?.includes(user.uid)
          );
          setPublicRooms(newPublicRooms);
      } catch (pubError) {
          console.error('Error loading public rooms:', pubError);
          // Don't toast here, just keep publicRooms empty
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
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await deleteRoom(roomId);
        toast.success('Room deleted successfully');
        loadData(); // Reload rooms
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error('Failed to delete room');
      }
    }
  };

  const handleJoinRequest = async (roomId, roomName) => {
    try {
        await requestJoin(roomId, user.uid, user.displayName || 'Anonymous');
        toast.success(`Requested to join ${roomName}`);
        setPublicRooms(prev => prev.filter(p => p.roomId !== roomId));
    } catch (error) {
        toast.error('Failed to send request');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setCreating(true);
    try {
      const room = await createRoom(roomName, user.uid, user.displayName || 'Anonymous');
      toast.success('Room created successfully!');
      setShowModal(false);
      setRoomName('');
      navigate(`/room/${room.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const openShareModal = (room) => {
    setSelectedRoom(room);
    setShowShareModal(true);
  };

  const filteredMyRooms = rooms.filter(r => r.roomName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPublicRooms = publicRooms.filter(r => r.roomName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="dashboard-header flex items-center justify-between" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
          <div>
            <h1 className="animate-slideUp" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
              Welcome back, <span className="gradient-text">{user?.displayName || 'Student'}</span>!
            </h1>
            <p className="text-secondary animate-slideUp">
              Ready to study with your friends?
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary animate-slideUp"
            style={{ whiteSpace: 'nowrap' }}
          >
            <FaPlus />
            Create Room
          </button>
        </div>

        {/* Search Bar */}
        <div className="animate-slideUp search-container" style={{ marginBottom: '3rem', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', opacity: 0.5 }} />
          <input 
            type="text" 
            placeholder="Search for study rooms..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              fontSize: '1rem',
              background: 'white',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: '4rem' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredMyRooms.length === 0 && filteredPublicRooms.length === 0 && searchTerm ? (
            <div className="text-center text-muted" style={{ padding: '3rem' }}>
                No rooms found matching "{searchTerm}"
            </div>
        ) : (
          <>
          {/* My Rooms */}
          {filteredMyRooms.length > 0 && (
             <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>Your Rooms</h3>
                <div className="rooms-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 'var(--spacing-lg)'
                }}>
                    {filteredMyRooms.map((room, index) => (
                    <div
                        key={room.roomId}
                        className="card card-hover animate-slideUp"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                <div className="card-header">
                  <h3 className="card-title">{room.roomName}</h3>
                  <p className="card-subtitle">
                    Created {room.createdAt ? format(room.createdAt.toDate(), 'MMM d, yyyy') : 'recently'}
                  </p>
                </div>

                <div className="card-body">
                  <div className="flex items-center gap-sm" style={{ marginBottom: '0.5rem' }}>
                    <FaUsers style={{ color: 'var(--color-primary)' }} />
                    <span className="text-secondary">
                      {room.participants?.length || 0} participant{room.participants?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap', marginTop: '1rem' }}>
                    {room.participantDetails?.slice(0, 3).map((participant, i) => (
                      <div key={i} className="avatar avatar-sm" title={participant.name}>
                        {participant.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    ))}
                    {room.participants?.length > 3 && (
                      <span className="text-sm text-muted">
                        +{room.participants.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    onClick={() => openShareModal(room)}
                    className="btn btn-ghost btn-sm"
                  >
                    <FaPlus />
                    Share
                  </button>
                  
                  {room.createdBy === user.uid && (
                    <button
                      onClick={() => handleDeleteRoom(room.roomId)}
                      className="btn btn-sm"
                      style={{ background: 'transparent', color: '#EF4444', border: '1px solid #FECACA' }}
                      title="Delete Room"
                    >
                      <FaTrash />
                    </button>
                  )}
                  
                  <button
                    onClick={() => navigate(`/room/${room.roomId}`)}
                    className="btn btn-primary btn-sm"
                  >
                    Enter
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && publicRooms.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 className="animate-slideUp" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <FaGlobe className="text-primary" /> Explore Public Rooms
          </h2>
          
          <div className="rooms-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            {publicRooms.map((room, index) => (
              <div
                key={room.roomId}
                className="card card-hover animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="card-header">
                  <h3 className="card-title">{room.roomName}</h3>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="card-subtitle">
                        Created {room.createdAt ? format(room.createdAt.toDate(), 'MMM d') : 'recently'}
                      </p>
                      <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>Public</span>
                   </div>
                </div>

                <div className="card-body">
                  <div className="flex items-center gap-sm" style={{ marginBottom: '1rem' }}>
                    <FaUsers style={{ color: 'var(--color-primary)' }} />
                    <span className="text-secondary">
                      {room.participants?.length || 0} active members
                    </span>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    onClick={() => handleJoinRoom(room.roomId)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <FaArrowRight />
                    Join Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
    )}
      </div>

      {/* Create Room Modal */}
      {showModal && (
        <div className="modal-overlay animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className="modal animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Study Room</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRoom}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Room Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Math Study Group"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    autoFocus
                    disabled={creating}
                  />
                  <p className="input-hint">
                    Choose a descriptive name for your study room
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? <div className="spinner spinner-sm"></div> : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomId={selectedRoom?.roomId}
        roomName={selectedRoom?.roomName}
      />

      <style>{`
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.5rem !important;
          }
          .dashboard-header .btn {
            width: 100%;
          }
          .search-container {
            margin-bottom: 2rem !important;
          }
          .rooms-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
