import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoomById, subscribeToRoom, approveJoinRequest, rejectJoinRequest, deleteRoom } from '../services/roomService';
import { getNotesByRoom, updateNoteSummary } from '../services/notesService';
import { getCurrentUser } from '../services/auth';
import { FaUsers, FaComments, FaStickyNote, FaTasks, FaGraduationCap, FaShare, FaFileAlt, FaHome, FaCheck, FaTimes, FaLock, FaArrowLeft, FaBars, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
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
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(roomId);
        toast.success('Room deleted');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete room');
      }
    }
  };

  const handleNoteUploaded = () => {
    loadNotes();
    setActiveTab('notes');
  };

  const handleStudyFlashcards = (note) => {
      if (note.flashcards?.length > 0) {
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
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'white' }}>
        <div className="spinner active" />
      </div>
    );
  }

  if (!room) return null;

  const tabs = [
    { id: 'chat', label: 'Chat', icon: <FaComments /> },
    { id: 'notes', label: 'Library', icon: <FaStickyNote /> },
    { id: 'flashcards', label: 'Materials', icon: <FaGraduationCap /> },
    { id: 'goals', label: 'Goals', icon: <FaTasks /> }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'white' }}>
      
      {/* Sidebar */}
      <motion.div 
        className={isSidebarOpen ? 'room-sidebar-open' : 'room-sidebar-closed'}
        style={{ 
          width: '280px', 
          padding: '2.5rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          background: '#F8FAFC',
          borderRight: '1px solid #E2E8F0',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1001,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div style={{ padding: '0 0.75rem', marginBottom: '3rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
             <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '8px' }} />
             <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1E293B' }}>EduCircle</h2>
          </Link>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'transparent', border: 'none', padding: 0 }}>
          <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.1em', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Workspace</p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
              className="btn btn-secondary"
              style={{
                justifyContent: 'flex-start',
                border: 'none',
                background: activeTab === tab.id ? '#EFF6FF' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : '#64748B',
                padding: '0.875rem 1.25rem',
                borderRadius: '12px',
                width: '100%',
                boxShadow: 'none'
              }}
            >
              <span style={{ fontSize: '1.1rem', minWidth: '28px' }}>{tab.icon}</span>
              <span style={{ fontWeight: activeTab === tab.id ? 700 : 500 }}>{tab.label}</span>
            </button>
          ))}
          
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #E2E8F0' }}>
            <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.1em', marginBottom: '1rem', paddingLeft: '0.75rem' }}>General</p>
            <Link to="/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', color: '#64748B', background: 'transparent', boxShadow: 'none' }}>
              <FaHome style={{ minWidth: '28px' }} /> Dashboard
            </Link>
            {currentUserRole === 'admin' && (
              <button onClick={handleDeleteRoom} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none', color: '#FDA4AF', background: 'transparent', boxShadow: 'none' }}>
                <FaTrash style={{ minWidth: '28px' }} /> Delete Room
              </button>
            )}
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
           <button onClick={() => setShowShareModal(true)} className="btn btn-primary" style={{ width: '100%' }}>
             <FaShare /> Invite Members
           </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="room-main-content" style={{ 
        flex: 1, 
        marginLeft: '280px',
        height: '100vh',
        overflowY: 'auto',
        background: 'white',
        position: 'relative'
      }}>
        
        {/* Workspace Header */}
        <div style={{ 
          height: '72px', 
          borderBottom: '1px solid #E2E8F0', 
          padding: '0 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="show-mobile btn btn-secondary" onClick={() => setIsSidebarOpen(true)} style={{ padding: '0.5rem', border: 'none' }}><FaBars /></button>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{room.roomName}</h3>
            <span className="badge badge-secondary">{room.participants?.length || 0} Online</span>
          </div>
          
          <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{user.displayName}</span>
             <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="User" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #EFF6FF' }} />
          </div>
        </div>

        {/* Dynamic Content */}
        <div style={{ padding: activeTab === 'chat' ? '0' : '3rem 2.5rem' }}>
          <AnimatePresence mode="wait">
             {activeTab === 'chat' && (
               <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: 'calc(100vh - 72px)' }}>
                 <ChatBox roomId={roomId} roomName={room.roomName} participantCount={room.participants?.length} />
               </motion.div>
             )}

             {activeTab === 'notes' && (
               <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Library</h2>
                      <p style={{ margin: 0 }}>Central hub for all study materials and AI summaries.</p>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{notes.length} Documents</span>
                 </div>
                 
                 <div className="card" style={{ padding: '2rem', marginBottom: '4rem', background: '#F8FAFC', borderStyle: 'dashed' }}>
                    <NoteUploader roomId={roomId} onNoteUploaded={handleNoteUploaded} />
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {notes.map((note) => (
                      <motion.div 
                        key={note.id} 
                        whileHover={{ y: -4 }}
                        className="card" 
                        onClick={() => setSelectedNote(note)}
                        style={{ padding: '1.75rem', cursor: 'pointer' }}
                      >
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                           <FaFileAlt style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }} />
                           <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8' }}>PDF</span>
                         </div>
                         <h4 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{note.fileName}</h4>
                         <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.summary}</p>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>{note.flashcards?.length || 0} Cards</span>
                            <FaArrowRight style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
                         </div>
                      </motion.div>
                    ))}
                 </div>
               </motion.div>
             )}

             {activeTab === 'flashcards' && (
               <motion.div key="flashcards" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                     {flashcardFilterName && <button onClick={handleResetFlashcards} className="btn btn-secondary" style={{ padding: '0.5rem', border: 'none' }}><FaArrowLeft /></button>}
                     <h2 style={{ margin: 0 }}>{flashcardFilterName ? `Studying: ${flashcardFilterName}` : 'Mastery Materials'}</h2>
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

      <AnimatePresence>
        {selectedNote && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNote(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card" style={{ width: '100%', maxWidth: '750px', padding: '3rem', maxHeight: '90vh', overflowY: 'auto', background: 'white' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                 <div style={{ flex: 1 }}>
                   <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>{selectedNote.fileName}</h2>
                   <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>AI Synthesis • Uploaded by {selectedNote.uploadedByName}</p>
                 </div>
                 <button onClick={() => setSelectedNote(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '2rem', lineHeight: 1, cursor: 'pointer' }}>×</button>
               </div>

               <div style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '3rem', lineHeight: 1.8 }}>
                 {isEditingNote ? (
                   <textarea value={editedSummary} onChange={(e) => setEditedSummary(e.target.value)} style={{ width: '100%', height: '300px' }} />
                 ) : (
                   <p style={{ whiteSpace: 'pre-wrap' }}>{selectedNote.summary}</p>
                 )}
               </div>

               <div style={{ display: 'flex', gap: '1rem' }}>
                 {isEditingNote ? (
                   <button onClick={handleSaveNote} className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                 ) : (
                   <>
                     <button onClick={() => handleStudyFlashcards(selectedNote)} className="btn btn-primary" style={{ flex: 2 }}>Master {selectedNote.flashcards?.length || 0} Concepts</button>
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
        .room-sidebar-closed { transform: translateX(-100%); }
        @media (min-width: 1025px) {
          .room-sidebar-closed, .room-sidebar-open { transform: none !important; }
        }
        @media (max-width: 1024px) {
          .room-main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Room;
