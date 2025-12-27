import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoomById, joinRoom, subscribeToRoom, generateRoomLink, approveJoinRequest, rejectJoinRequest, deleteRoom } from '../services/roomService';
import { getNotesByRoom, updateNoteSummary } from '../services/notesService';
import { getCurrentUser, signOut } from '../services/auth';
import { FaUsers, FaCopy, FaComments, FaStickyNote, FaTasks, FaGraduationCap, FaShare, FaFileAlt, FaHome, FaUser, FaSignOutAlt, FaUserPlus, FaCheck, FaTimes, FaLock, FaArrowLeft, FaBars, FaTrash, FaCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import NoteUploader from '../components/NoteUploader';
import Flashcards from '../components/Flashcards';
import StudyGoals from '../components/StudyGoals';
import ShareModal from '../components/ShareModal';

const Room = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  
  const [allFlashcards, setAllFlashcards] = useState([]);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);
  const [flashcardFilterName, setFlashcardFilterName] = useState(null);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    loadRoom();
    loadNotes();
  }, [roomId]);

  useEffect(() => {
    if (!room) return;
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        updateUserRole(updatedRoom);
      }
    });
    return () => unsubscribe();
  }, [roomId, room]);

  const updateUserRole = (roomData) => {
    if (roomData.participants?.includes(user.uid)) {
        const details = roomData.participantDetails?.find(p => p.userId === user.uid);
        setCurrentUserRole(details?.role || 'member');
    } else if (roomData.isPublic) {
        setCurrentUserRole('viewer');
    } else {
        toast.error('Access Denied');
        navigate('/dashboard');
    }
  };

  const loadRoom = async () => {
    try {
      let roomData = await getRoomById(roomId);
      if (!roomData) {
        toast.error('Room not found');
        navigate('/dashboard');
        return;
      }
      setRoom(roomData);
      updateUserRole(roomData);
    } catch (error) {
      toast.error('Failed to load room');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const roomNotes = await getNotesByRoom(roomId);
      setNotes(roomNotes);
      const flashcards = roomNotes.flatMap(note => note.flashcards || []);
      setAllFlashcards(flashcards);
      setCurrentFlashcards(flashcards);
    } catch (error) {
      toast.error('Failed to load notes');
    }
  };

  const handleDeleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await deleteRoom(roomId);
        toast.success('Room deleted');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete room');
      }
    }
  };

  const handleNoteUploaded = (noteData) => {
    loadNotes();
    setActiveTab('notes');
  };

  const handleStudyFlashcards = (note) => {
      if (note.flashcards && note.flashcards.length > 0) {
          setCurrentFlashcards(note.flashcards);
          setFlashcardFilterName(note.fileName);
          setActiveTab('flashcards');
          setSelectedNote(null);
      } else {
          toast.error('No flashcards available');
      }
  };
  
  const handleResetFlashcards = () => {
    setCurrentFlashcards(allFlashcards);
    setFlashcardFilterName(null);
  };

  const handleEditNote = () => {
    setEditedSummary(selectedNote.summary);
    setIsEditingNote(true);
  };

  const handleSaveNote = async () => {
    try {
      await updateNoteSummary(selectedNote.id, editedSummary);
      toast.success('Summary updated!');
      setIsEditingNote(false);
      setSelectedNote({ ...selectedNote, summary: editedSummary });
      setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, summary: editedSummary } : n));
    } catch (error) {
      toast.error('Failed to update summary');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
        <div className="spinner active" />
      </div>
    );
  }

  if (!room) return null;

  const tabs = [
    { id: 'chat', label: 'Chat', icon: <FaComments /> },
    { id: 'notes', label: 'Notes', icon: <FaStickyNote /> },
    { id: 'flashcards', label: 'Flashcards', icon: <FaGraduationCap /> },
    { id: 'goals', label: 'Goals', icon: <FaTasks /> }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg-main)', color: 'white' }}>
      
      {/* Premium Sidebar */}
      <motion.div 
        className={`custom-scrollbar ${isSidebarOpen ? 'room-sidebar-open' : 'room-sidebar-closed'}`}
        style={{ 
          width: '300px', 
          padding: '3rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--glass-border)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1001,
          transition: 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
             <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '8px' }} />
             <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>EduCircle</h2>
          </Link>
          <button className="show-mobile" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem' }}><FaTimes /></button>
        </div>

        <div style={{ marginBottom: '4rem' }}>
          <Link to="/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1.2rem', borderColor: 'transparent', background: 'rgba(255,255,255,0.03)' }}>
            <FaHome style={{ opacity: 0.6 }} /> Dashboard
          </Link>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Workspace</p>
          <div className="flex flex-col" style={{ gap: '0.5rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  justifyContent: 'flex-start',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                  padding: '1rem 1.2rem',
                  borderRadius: '12px',
                  width: '100%'
                }}
              >
                <span style={{ fontSize: '1.2rem', minWidth: '30px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Administration Section */}
        {currentUserRole === 'admin' && (
          <div style={{ marginTop: '2rem' }}>
            <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>Administration</p>
            <button onClick={handleDeleteRoom} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-error)' }}>
               <FaTrash /> Delete Room
            </button>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button onClick={() => setShowShareModal(true)} className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>
            <FaShare /> Invite Others
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="room-main-content" style={{ 
        flex: 1, 
        marginLeft: '300px',
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--color-bg-main)',
        position: 'relative'
      }}>
        
        {/* Header Strip */}
        <div style={{ 
          height: '80px', 
          borderBottom: '1px solid var(--glass-border)', 
          padding: '0 3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div>
            <h3 style={{ margin: 0 }}>{room.roomName}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>STUDYING NOW: {room.participants?.length || 0} MEMBERS</span>
          </div>

          <button className="show-mobile btn btn-secondary" onClick={() => setIsSidebarOpen(true)} style={{ padding: '0.6rem' }}><FaBars /></button>
          
          <div className="hidden-mobile flex items-center gap-md">
             <div className="avatar-small">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="User" />
             </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div style={{ padding: activeTab === 'chat' ? '0' : '3rem' }}>
          <AnimatePresence mode="wait">
             {activeTab === 'chat' && (
               <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 'calc(100vh - 80px)' }}>
                 <ChatBox roomId={roomId} roomName={room.roomName} participantCount={room.participants?.length} />
               </motion.div>
             )}

             {activeTab === 'notes' && (
               <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <div className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
                    <h1>Circle Knowledge Base</h1>
                    <span className="badge badge-secondary">{notes.length} Documents</span>
                 </div>
                 
                 <div className="glass-card" style={{ padding: '2rem', marginBottom: '4rem', background: 'rgba(99, 102, 241, 0.05)' }}>
                    <NoteUploader roomId={roomId} onNoteUploaded={handleNoteUploaded} />
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {notes.map((note) => (
                      <motion.div 
                        key={note.id} 
                        whileHover={{ y: -5 }}
                        className="glass-card" 
                        onClick={() => setSelectedNote(note)}
                        style={{ padding: '2rem', cursor: 'pointer' }}
                      >
                         <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                           <FaFileAlt style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }} />
                           <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>PDF</span>
                         </div>
                         <h4 style={{ marginBottom: '0.5rem' }}>{note.fileName}</h4>
                         <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.summary}</p>
                         <div className="flex justify-between items-center" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
                            <span className="text-xs text-muted">AIGen: {note.flashcards?.length || 0} Cards</span>
                            <FaArrowRight style={{ color: 'var(--color-primary)' }} />
                         </div>
                      </motion.div>
                    ))}
                 </div>
               </motion.div>
             )}

             {activeTab === 'flashcards' && (
               <motion.div key="flashcards" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="flex items-center gap-md" style={{ marginBottom: '3rem' }}>
                     {flashcardFilterName && <button onClick={handleResetFlashcards} className="btn btn-secondary" style={{ padding: '0.5rem' }}><FaArrowLeft /></button>}
                     <h1>{flashcardFilterName ? `Mastering: ${flashcardFilterName}` : 'Circle Mastery Cards'}</h1>
                  </div>
                  <Flashcards flashcards={currentFlashcards} />
               </motion.div>
             )}

             {activeTab === 'goals' && (
               <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <StudyGoals roomId={roomId} participants={room.participantDetails || []} />
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>

      {/* Note Detail / Summary Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNote(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '800px', padding: '4rem', maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-bg-card)' }}>
               <div className="flex justify-between items-start" style={{ marginBottom: '3rem' }}>
                 <div>
                   <h2 style={{ marginBottom: '0.5rem' }}>{selectedNote.fileName}</h2>
                   <span className="text-muted">Extracted by Gemini AI • {selectedNote.uploadedByName}</span>
                 </div>
                 <button onClick={() => setSelectedNote(null)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '2rem' }}>×</button>
               </div>

               <div style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '4rem' }}>
                 {isEditingNote ? (
                   <textarea value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} style={{ width: '100%', height: '300px', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
                 ) : (
                   <p>{selectedNote.summary}</p>
                 )}
               </div>

               <div className="flex gap-lg">
                 {isEditingNote ? (
                   <button onClick={handleSaveNote} className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                 ) : (
                   <>
                     <button onClick={() => handleStudyFlashcards(selectedNote)} className="btn btn-primary" style={{ flex: 2 }}>Study {selectedNote.flashcards?.length || 0} Flashcards</button>
                     <button onClick={handleEditNote} className="btn btn-secondary" style={{ flex: 1 }}>Edit Summary</button>
                   </>
                 )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} roomId={roomId} roomName={room.roomName} />
      
      <style>{`
        .nav-link { color: white; text-decoration: none; opacity: 0.6; transition: 0.2s; }
        .nav-link:hover { opacity: 1; }
        .room-sidebar-closed { transform: translateX(-100%); }
        @media (min-width: 1025px) {
          .room-sidebar-closed, .room-sidebar-open { transform: none !important; }
        }
        @media (max-width: 1024px) {
          .room-main-content { marginLeft: 0 !important; }
        }
        .avatar-small { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--color-primary); overflow: hidden; }
        .avatar-small img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </div>
  );
};

export default Room;
