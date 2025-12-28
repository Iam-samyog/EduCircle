import { useState } from 'react';
import { saveNote } from '../services/notesService';
import { getCurrentUser } from '../services/auth';
import { FaUpload, FaFileAlt, FaCheckCircle, FaPen } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NoteUploader = ({ roomId, onNoteUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const user = getCurrentUser();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type - only text files for simplicity
    if (!file.type.startsWith('text/') && file.name.endsWith('.txt') === false) {
      toast.error('Only text files (.txt) are supported for now');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const content = await file.text();
      
      const noteData = await saveNote(
        roomId,
        user.uid,
        user.displayName || 'Anonymous',
        {
          content,
          fileName: file.name,
          flashcards: []
        }
      );

      toast.success('Note saved successfully!');

      if (onNoteUploaded) {
        onNoteUploaded(noteData);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(error.message || 'Failed to save note');
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setUploading(true);

    try {
      const noteData = await saveNote(
        roomId,
        user.uid,
        user.displayName || 'Anonymous',
        {
          content: noteText,
          fileName: noteTitle || 'Untitled Note',
          flashcards: []
        }
      );

      toast.success('Note saved successfully!');
      setNoteText('');
      setNoteTitle('');
      setShowTextInput(false);

      if (onNoteUploaded) {
        onNoteUploaded(noteData);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(error.message || 'Failed to save note');
    } finally {
      setUploading(false);
    }
  };

  if (showTextInput) {
    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h3>Create New Note</h3>
          <button 
            className="btn btn-ghost" 
            onClick={() => setShowTextInput(false)}
          >
            Cancel
          </button>
        </div>
        
        <input
          type="text"
          className="input"
          placeholder="Note Title (optional)"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />
        
        <textarea
          className="input"
          placeholder="Type your notes here..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          style={{ 
            minHeight: '200px', 
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        
        <button
          className="btn btn-primary"
          onClick={handleTextSubmit}
          disabled={uploading || !noteText.trim()}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          {uploading ? <div className="spinner spinner-sm"></div> : 'Save Note'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Upload File Option */}
        <div
          className={`card card-hover ${dragActive ? 'animate-glow' : ''}`}
          style={{
            padding: '2rem',
            textAlign: 'center',
            border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--glass-border)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".txt"
            onChange={handleChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />

          {uploading ? (
            <div>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p>Saving...</p>
            </div>
          ) : (
            <div>
              <FaUpload style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
              <p className="font-semibold">Upload File</p>
              <p className="text-sm text-muted">Drop .txt file or click</p>
            </div>
          )}
        </div>

        {/* Type Note Option */}
        <div
          className="card card-hover"
          style={{
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setShowTextInput(true)}
        >
          <FaPen style={{ fontSize: '2.5rem', color: 'var(--color-success)', marginBottom: '1rem' }} />
          <p className="font-semibold">Type Notes</p>
          <p className="text-sm text-muted">Write notes manually</p>
        </div>
      </div>
    </div>
  );
};

export default NoteUploader;
