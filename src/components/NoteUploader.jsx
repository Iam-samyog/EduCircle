import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { processNote } from '../services/notesService';
import { getCurrentUser } from '../services/auth';
import { FaCloudUploadAlt, FaBrain } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NoteUploader = ({ roomId, onNoteUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const user = getCurrentUser();

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = async (file) => {
    const validExts = ['.txt', '.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExts.includes(ext)) return toast.error('Supported: .txt, .pdf, .docx');
    if (file.size > 10 * 1024 * 1024) return toast.error('File too large (max 10MB)');

    setUploading(true);
    setProgress(20);

    try {
      const noteData = await processNote(roomId, user.uid, user.displayName || 'Anonymous', file);
      setProgress(100);
      toast.success('AI Synthesis Complete!');
      if (onNoteUploaded) onNoteUploaded(noteData);
      setTimeout(() => setUploading(false), 1500);
    } catch (error) {
      toast.error('Synthesis failed');
      setUploading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {!uploading ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              border: `2px dashed ${dragActive ? 'var(--color-primary)' : '#E2E8F0'}`,
              background: dragActive ? '#EFF6FF' : 'white',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: dragActive ? '0 10px 25px rgba(59, 130, 246, 0.1)' : 'none'
            }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleChange} style={{ display: 'none' }} />
            
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem'
            }}>
              <FaCloudUploadAlt style={{ color: 'var(--color-primary)' }} />
            </div>
            
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Upload Study Material</h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                Drop your PDFs or documents here. Gemini AI will automatically summarize them for the group.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{ padding: '4rem 2rem', textAlign: 'center' }}
          >
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                 <div className="spinner active" style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem auto' }} />
                 <h3 style={{ fontSize: '1.25rem' }}>{progress < 100 ? 'AI is Synthesizing...' : 'Done!'}</h3>
              </div>
              
              <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'var(--color-primary)' }}
                />
              </div>
              <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>{progress}% Complete</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteUploader;
