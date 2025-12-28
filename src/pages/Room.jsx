import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getRoomById, joinRoom, subscribeToRoom, generateRoomLink, approveJoinRequest, rejectJoinRequest, deleteRoom } from '../services/roomService';
import { getNotesByRoom, updateNoteContent, deleteNote, updateNoteFlashcards as updateNoteFlashcardsService } from '../services/notesService';
import { createDeck, subscribeToDecks, updateDeckFlashcards, deleteDeck, updateDeckTitle } from '../services/deckService';
import { getCurrentUser, signOut } from '../services/auth';
import { FaUsers, FaCopy, FaComments, FaStickyNote, FaTasks, FaGraduationCap, FaShare, FaFileAlt, FaHome, FaUser, FaSignOutAlt, FaUserPlus, FaCheck, FaTimes, FaLock, FaArrowLeft, FaBars, FaTrash, FaPlus, FaLayerGroup, FaBookOpen, FaLightbulb } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import NoteUploader from '../components/NoteUploader';
import Flashcards from '../components/Flashcards';
import FlashcardCreator from '../components/FlashcardCreator';
import StudyGoals from '../components/StudyGoals';
import ShareModal from '../components/ShareModal';
import ConfirmModal from '../components/ConfirmModal';

const Room = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  
  // Decks state
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [showFlashcardCreator, setShowFlashcardCreator] = useState(false);

  // Other state
  const [allFlashcards, setAllFlashcards] = useState([]);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);
  const [flashcardFilterName, setFlashcardFilterName] = useState(null);
  const [studyingNoteId, setStudyingNoteId] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Delete'
  });
  
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    loadRoom();
    loadNotes();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        updateUserRole(updatedRoom);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribeDecks = subscribeToDecks(roomId, (updatedDecks) => {
      console.log('Decks updated in Room.jsx:', updatedDecks.length);
      setDecks(updatedDecks);
    });

    return () => unsubscribeDecks();
  }, [roomId]);

  // Sync selectedDeck when decks list updates (e.g., card added in this or another tab)
  useEffect(() => {
    if (selectedDeck) {
      const freshDeck = decks.find(d => d.id === selectedDeck.id);
      if (freshDeck && JSON.stringify(freshDeck.flashcards) !== JSON.stringify(selectedDeck.flashcards)) {
        setSelectedDeck(freshDeck);
      }
    }
  }, [decks]);

  const updateUserRole = (roomData) => {
    if (roomData.participants?.includes(user.uid)) {
        const details = roomData.participantDetails?.find(p => p.userId === user.uid);
        setCurrentUserRole(details?.role || 'member');
    } else if (roomData.isPublic) {
        setCurrentUserRole('viewer');
    } else {
        // Not a participant and private -> Redirect
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
      console.error('Error loading room:', error);
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
      
      // Combine all flashcards from all notes
      const flashcards = roomNotes.flatMap(note => note.flashcards || []);
      setAllFlashcards(flashcards);
      setCurrentFlashcards(flashcards); // Default to all
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    }
  };

  const handleDeleteRoom = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Room?",
      message: "Are you sure you want to delete this room? This action cannot be undone.",
      confirmText: "Delete Room",
      onConfirm: async () => {
        try {
          await deleteRoom(roomId, user.uid);
          toast.success('Room deleted successfully');
          navigate('/dashboard');
        } catch (error) {
          console.error('Error deleting room:', error);
          toast.error('Failed to delete room');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleNoteUploaded = (noteData) => {
    loadNotes();
    setActiveTab('notes');
  };

  const handleStudyDeck = (deck) => {
    setSelectedDeck(deck);
    setActiveTab('flashcards');
    setSelectedNote(null);
  };

  const handleResetFlashcards = () => {
    setSelectedDeck(null);
    setShowFlashcardCreator(false);
  };

  const handleEditNote = () => {
    setEditedContent(selectedNote.content);
    setIsEditingNote(true);
  };

  const handleSaveNote = async () => {
    try {
      await updateNoteContent(selectedNote.id, user.uid, editedContent);
      toast.success('Note updated!');
      setIsEditingNote(false);
      setSelectedNote({ ...selectedNote, content: editedContent });
      loadNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };
  const handleDeleteNote = (noteId, e) => {
    if (e) e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: "Delete Note?",
      message: "Are you sure you want to delete this note?",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteNote(noteId, user.uid);
          toast.success('Note deleted successfully');
          loadNotes();
          if (selectedNote?.id === noteId) {
            setSelectedNote(null);
          }
        } catch (error) {
          console.error('Error deleting note:', error);
          toast.error('Failed to delete note');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteFlashcard = (index) => {
    if (!selectedDeck) return;

    if (selectedDeck.isNoteLegacy) {
      toast.error('Cannot delete flashcards from a note-based deck. Extract them to a new deck first!');
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title: "Delete Flashcard?",
      message: "Are you sure you want to delete this flashcard?",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const updatedFlashcards = selectedDeck.flashcards.filter((_, i) => i !== index);
          await updateDeckFlashcards(selectedDeck.id, user.uid, updatedFlashcards);
          toast.success('Flashcard deleted');
        } catch (error) {
          console.error('Error deleting flashcard:', error);
          toast.error('Failed to delete flashcard');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleAddFlashcardToDeck = async (newCard) => {
    if (!selectedDeck) return;
    try {
      const updatedFlashcards = [...(selectedDeck.flashcards || []), newCard];
      await updateDeckFlashcards(selectedDeck.id, updatedFlashcards);
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) {
      toast.error('Please enter a deck title');
      return;
    }

    try {
      const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
      await createDeck(roomId, user.uid, userName, newDeckTitle);
      toast.success('Deck created!');
      setNewDeckTitle('');
      setShowDeckModal(false);
    } catch (error) {
      console.error('Detailed error creating deck:', error);
      toast.error(`Failed to create deck: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteDeck = (deckId, e) => {
    if (e) e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: "Delete Deck?",
      message: "Are you sure you want to delete this deck and all its flashcards?",
      confirmText: "Delete Deck",
      onConfirm: async () => {
        try {
          await deleteDeck(deckId, user.uid);
          toast.success('Deck deleted');
          if (selectedDeck?.id === deckId) {
            setSelectedDeck(null);
          }
        } catch (error) {
          console.error('Error deleting deck:', error);
          toast.error('Failed to delete deck');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditingNote(false);
    setEditedContent('');
  };


  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#000' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  const tabs = [
    { id: 'chat', label: 'Chat', icon: <FaComments /> },
    { id: 'notes', label: 'Notes', icon: <FaStickyNote /> },
    { id: 'flashcards', label: 'Flashcards', icon: <FaGraduationCap /> },
    { id: 'goals', label: 'Goals', icon: <FaTasks /> }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg-primary)' }}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="show-mobile"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex'
          }}
        />
      )}

      {/* Unified Sidebar Navigation */}
      <div className={`custom-scrollbar ${isSidebarOpen ? 'room-sidebar-open' : 'room-sidebar-closed'}`} style={{ 
        width: '280px', 
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        background: 'black',
        color: 'white',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1001,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
      }}>
        {/* Mobile Close Button */}
        <button 
          className="show-mobile"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          <FaTimes />
        </button>

        {/* App Logo */}
        <Link to="/" style={{ 
          fontSize: '1.8rem', 
          fontFamily: 'var(--font-serif)', 
          marginBottom: '2rem',
          display: 'block',
          color: 'white',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          EduCircle
        </Link>

        {/* Global Navigation (Top) */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link to="/dashboard" className="btn-ghost side-nav-item" style={{ 
            justifyContent: 'flex-start', 
            padding: '1rem 1.25rem', 
            background: 'rgba(255,255,255,0.05)', 
            border: 'none', 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1rem', 
            fontWeight: 500,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease',
          }}>
            <span style={{ fontSize: '1.2rem', minWidth: '35px' }}><FaHome /></span>
            Dashboard
          </Link>
        </div>
        
        {/* Room Information */}
        <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', lineHeight: '1.3', fontWeight: 600, color: 'white' }}>{room.roomName}</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUsers />
            {room.participants?.length || 0} participants
          </p>
        </div>

        {/* Room Navigation Tabs */}
        <div className="flex flex-col" style={{ gap: '0.5rem', flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn-ghost"
              style={{
                justifyContent: 'flex-start',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: 'white',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                width: '100%',
                fontWeight: activeTab === tab.id ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.25rem'
              }}
            >
              <span style={{ fontSize: '1.2rem', minWidth: '35px', opacity: activeTab === tab.id ? 1 : 0.7 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setShowShareModal(true)} 
              className="btn-ghost"
              style={{ 
                justifyContent: 'flex-start',
                padding: '1rem 1.25rem',
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 400,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '12px'
              }}
            >
              <span style={{ fontSize: '1.1rem', minWidth: '35px', opacity: 0.6 }}><FaShare /></span>
              Share Room
            </button>
          </div>
        </div>

        {/* Global Navigation (Bottom) */}
        <div style={{ marginTop: 'auto', paddingTop: '3rem' }}>
           <Link to="/profile" className="flex items-center gap-md" style={{ 
              marginTop: '2rem', 
              opacity: 0.8, 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              paddingTop: '2rem',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
           }}>
              <div className="avatar avatar-sm" style={{ borderColor: 'white', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} />
                ) : (
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>{user.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="text-sm" style={{ color: 'white', fontWeight: 500 }}>{user.displayName}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>View Profile</span>
              </div>
           </Link>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="room-main-content" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: activeTab === 'chat' ? '0' : '3rem 4rem',
        background: '#F9FAFB',
        height: '100vh',
        position: 'relative',
        marginLeft: '280px',
        transition: 'margin-left 0.3s ease'
      }}>
        
        {/* Mobile Sidebar Toggle Button */}
        <button 
          className="show-mobile hamburger-btn"
          onClick={() => setIsSidebarOpen(true)}
          style={{
            position: 'fixed',
            top: '0.75rem',
            right: '1rem',
            width: '3rem',
            height: '3rem'
          }}
        >
          <FaBars style={{ fontSize: '1.25rem' }} />
        </button>

        
        {/* Viewer Banner */}
        {currentUserRole === 'viewer' && (
            <div style={{ background: 'var(--color-primary)', color: 'white', padding: '0.75rem', textAlign: 'center', fontWeight: 500 }}>
                <FaLock style={{ marginRight: '0.5rem', marginBottom: '2px' }} />
                You are in Viewer Mode. Request access to chat and edit.
            </div>
        )}

        {/* Admin Join Requests Panel */}
        {currentUserRole === 'admin' && room.joinRequests?.length > 0 && (
            <div className="card" style={{ margin: '1rem', padding: '1rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', color: 'var(--color-text-primary)' }}>
                    <FaUserPlus style={{ marginRight: '0.5rem' }} /> 
                    Join Requests ({room.joinRequests.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {room.joinRequests.map((req, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.75rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{req.userName}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => approveJoinRequest(roomId, req)} className="btn btn-sm" style={{ background: 'var(--color-success)', color: 'white', border: 'none' }}><FaCheck /></button>
                                <button onClick={() => rejectJoinRequest(roomId, req)} className="btn btn-sm" style={{ background: 'var(--color-error)', color: 'white', border: 'none' }}><FaTimes /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Admin Management Actions */}
        {currentUserRole === 'admin' && (
            <div className="card" style={{ margin: '1rem', padding: '1.5rem', background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', color: '#9A3412' }}>
                    <FaLock style={{ marginRight: '0.5rem' }} /> 
                    Room Administration
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <button 
                        onClick={handleDeleteRoom}
                        className="btn btn-sm"
                        style={{ background: '#EF4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaTrash /> Delete Room (Permanent)
                    </button>
                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="btn btn-sm"
                        style={{ background: 'var(--color-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaShare /> Copy Invite Link
                    </button>
                </div>
            </div>
        )}

        {/* Chat - Fullscreen Mode */}
        {activeTab === 'chat' && (
           <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}> 
              <ChatBox 
                roomId={roomId} 
                roomName={room.roomName} 
                participantCount={room.participants?.length} 
              />
           </div>
        )}

        {/* Other Tabs - Standard Container Mode */}
        {activeTab !== 'chat' && (
          <div className="animate-fadeIn" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {activeTab === 'notes' && (
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                   <h2>Study Notes</h2>
                </div>
                
                <NoteUploader roomId={roomId} onNoteUploaded={handleNoteUploaded} />

                {notes.length > 0 && (
                  <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>Library</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {notes.map((note) => (
                        <div 
                          key={note.id} 
                          className="card card-hover" 
                          onClick={() => setSelectedNote(note)}
                          style={{ 
                              padding: '1.5rem', 
                              background: '#FFFFFF', 
                              border: '1px solid #BFDBFE',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                            <div className="flex items-center gap-sm">
                                <FaFileAlt style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }} />
                                <span className="text-xs text-muted" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px' }}>PDF</span>
                            </div>
                            {(currentUserRole === 'admin' || note.uploadedBy === user?.uid) && (
                                <button 
                                    onClick={(e) => handleDeleteNote(note.id, e)}
                                    className="btn-ghost" 
                                    style={{ color: 'var(--color-error)', padding: '0.25rem' }}
                                >
                                    <FaTrash />
                                </button>
                            )}
                          </div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#111827' }}>{note.fileName}</h4>
                          <p style={{ 
                            marginBottom: '1rem', 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            height: '2.5rem',
                            fontSize: '0.9rem',
                            color: '#6B7280'
                          }}>
                            {note.content || 'Empty note.'}
                          </p>
                          <div className="flex justify-between items-center" style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
                            <span className="text-xs text-muted">By {note.uploadedByName}</span>
                            <span className="badge badge-secondary" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-primary)' }}>{note.flashcards?.length || 0} Cards</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

             {activeTab === 'flashcards' && (
               <div>
                  {!selectedDeck ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                        <div>
                          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Flashcard Decks</h2>
                          <p className="text-muted">Master your notes with interactive study sets</p>
                        </div>
                        {(currentUserRole === 'admin' || currentUserRole === 'member') && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDeckModal(true)} 
                            className="btn btn-primary"
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                            }}
                          >
                            <FaPlus /> Create Deck
                          </motion.button>
                        )}
                      </div>
 
                      {decks.length === 0 ? (
                        <div 
                          className="card" 
                          style={{ 
                            padding: '5rem 3rem', 
                            textAlign: 'center', 
                            background: 'white',
                            borderRadius: '24px',
                            border: '1px dashed #e2e8f0'
                          }}
                        >
                          <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            background: '#f8fafc', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                          }}>
                            <FaLayerGroup style={{ fontSize: '2rem', color: '#94a3b8' }} />
                          </div>
                          <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>No decks yet</h3>
                          <p className="text-muted" style={{ maxWidth: '300px', margin: '0 auto 2rem' }}>Create your first deck to start organizing your flashcards and studying effectively.</p>
                          {(currentUserRole === 'admin' || currentUserRole === 'member') && (
                            <button onClick={() => setShowDeckModal(true)} className="btn btn-primary">
                              Get Started
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                          <AnimatePresence>
                            {decks.map((deck, idx) => (
                              <motion.div 
                                key={deck.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="card card-hover" 
                                onClick={() => handleStudyDeck(deck)}
                                style={{ 
                                  padding: '1.75rem', 
                                  background: 'white', 
                                  cursor: 'pointer', 
                                  border: '1px solid #f1f5f9',
                                  borderRadius: '20px',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)'
                                }}
                              >
                                {/* Decorative background element */}
                                <div style={{ 
                                  position: 'absolute', 
                                  top: '-20px', 
                                  right: '-20px', 
                                  width: '100px', 
                                  height: '100px', 
                                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 100%)',
                                  borderRadius: '50%',
                                  zIndex: 0
                                }} />

                                <div className="flex justify-between items-start" style={{ marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
                                  <div style={{ 
                                    width: '44px', 
                                    height: '44px', 
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                                    borderRadius: '12px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#2563eb'
                                  }}>
                                    <FaBookOpen style={{ fontSize: '1.2rem' }} />
                                  </div>
                                  {(currentUserRole === 'admin' || deck.createdBy === user.uid) && (
                                    <motion.button 
                                      whileHover={{ scale: 1.1, color: '#ef4444' }}
                                      onClick={(e) => handleDeleteDeck(deck.id, e)}
                                      className="btn-ghost"
                                      style={{ color: '#94a3b8', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}
                                    >
                                      <FaTrash />
                                    </motion.button>
                                  )}
                                </div>
                                <h4 style={{ marginBottom: '0.75rem', color: '#1e293b', fontSize: '1.25rem', fontWeight: 600, position: 'relative', zIndex: 1 }}>{deck.title}</h4>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                  <div className="badge" style={{ background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {deck.flashcards?.length || 0} CARDS
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FaLightbulb /> 
                                    <span>Ready to study</span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center" style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', position: 'relative', zIndex: 1 }}>
                                  <div className="flex items-center gap-sm">
                                    <div className="avatar avatar-xs" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                      {deck.createdByName?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{deck.createdByName}</span>
                                  </div>
                                  <motion.span 
                                    whileHover={{ x: 4 }}
                                    style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  >
                                    Study <FaArrowLeft style={{ transform: 'rotate(180deg)', fontSize: '0.7rem' }} />
                                  </motion.span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                           <motion.button 
                            whileHover={{ scale: 1.1, x: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleResetFlashcards} 
                            className="btn-ghost" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              background: 'white', 
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                           >
                             <FaArrowLeft />
                           </motion.button>
                           <div>
                             <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>{selectedDeck.title}</h2>
                             <div className="flex items-center gap-sm" style={{ marginTop: '0.25rem' }}>
                               <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{selectedDeck.flashcards?.length || 0} CARDS</span>
                               <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Created by {selectedDeck.createdByName}</span>
                             </div>
                           </div>
                         </div>
                         <motion.button 
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => setShowFlashcardCreator(true)} 
                           className="btn btn-secondary"
                           style={{ borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                         >
                           <FaPlus /> Add New Card
                         </motion.button>
                      </div>

                     {showFlashcardCreator && (
                       <FlashcardCreator 
                         onAddFlashcard={handleAddFlashcardToDeck} 
                         onCancel={() => setShowFlashcardCreator(false)} 
                       />
                     )}

                     {selectedDeck.flashcards && selectedDeck.flashcards.length > 0 ? (
                       <Flashcards 
                         flashcards={selectedDeck.flashcards} 
                         onDelete={handleDeleteFlashcard}
                         isAdmin={currentUserRole === 'admin' || selectedDeck.createdBy === user.uid}
                       />
                     ) : (
                       <div className="card" style={{ padding: '4rem', textAlign: 'center', background: 'white' }}>
                         <p className="text-muted" style={{ marginBottom: '1.5rem' }}>This deck is empty.</p>
                         <button onClick={() => setShowFlashcardCreator(true)} className="btn btn-primary">
                           Add your first card
                         </button>
                       </div>
                     )}
                    </motion.div>
                  )}
               </div>
            )}

            {activeTab === 'goals' && (
              <StudyGoals roomId={roomId} participants={room.participantDetails || []} />
            )}
           </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomId={roomId}
        roomName={room.roomName}
      />
      
      {/* Create Deck Modal */}
      {showDeckModal && (
        <div className="modal-overlay animate-fadeIn" onClick={() => setShowDeckModal(null)}>
          <div className="modal animate-slideUp" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Deck</h2>
              <button className="modal-close" onClick={() => setShowDeckModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748B', marginBottom: '0.5rem' }}>Deck Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Biology Midterm"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowDeckModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateDeck}>Create Deck</button>
            </div>
          </div>
        </div>
      )}

      {/* Note Summary Modal */}
      {selectedNote && (
          <div className="modal-overlay animate-fadeIn" onClick={() => setSelectedNote(null)}>
            <div className="modal animate-slideUp" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FaFileAlt style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }} />
                    <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>{selectedNote.fileName}</h2>
                </div>
                <button className="modal-close" onClick={() => setSelectedNote(null)}>×</button>
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: '#374151', margin: 0 }}>Content</h4>
                    {!isEditingNote && (
                      <button className="btn btn-sm btn-secondary" onClick={handleEditNote}>
                        Edit
                      </button>
                    )}
                  </div>
                  
                  {isEditingNote ? (
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '300px',
                        padding: '1rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <div style={{ lineHeight: '1.6', color: '#4B5563', whiteSpace: 'pre-wrap', minHeight: '200px' }}>
                        {selectedNote.content || 'Empty content.'}
                    </div>
                  )}
              </div>
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                  <span className="text-sm text-muted">Uploaded by {selectedNote.uploadedByName}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditingNote ? (
                      <>
                        <button className="btn btn-ghost" onClick={handleCancelEdit}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSaveNote}>
                          <FaCheck /> Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-ghost" onClick={() => setSelectedNote(null)}>Close</button>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => handleStudyFlashcards(selectedNote)}
                            disabled={!selectedNote.flashcards || selectedNote.flashcards.length === 0}
                        >
                            <FaGraduationCap /> Study Flashcards
                        </button>
                      </>
                    )}
                  </div>
              </div>
            </div>
          </div>
      )}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
      />

      <style>{`
        @media (max-width: 1024px) {
          .room-main-content {
            margin-left: 280px;
            padding: ${activeTab === 'chat' ? '0' : '2rem 2rem'} !important;
          }
        }

        @media (max-width: 768px) {
          .room-sidebar-closed {
            transform: translateX(-100%);
          }
          .room-sidebar-open {
            transform: translateX(0);
          }
          .room-main-content {
            margin-left: 0 !important;
            padding: ${activeTab === 'chat' ? '0' : '1.5rem 1rem'} !important;
          }
          .hidden-mobile {
            display: none !important;
          }
          .show-mobile {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .show-mobile {
            display: none !important;
          }
          .room-sidebar-closed, .room-sidebar-open {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Room;
