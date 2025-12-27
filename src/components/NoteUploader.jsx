import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { processNote } from '../services/notesService';
import { getCurrentUser } from '../services/auth';
import { FaUpload, FaFileAlt, FaCheckCircle, FaSpinner, FaCloudUploadAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NoteUploader = ({ roomId, onNoteUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
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
    const validExtensions = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Supported formats: .txt, .pdf, .docx');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      setProgress(20);
      setProcessing(true);
      
      const noteData = await processNote(
        roomId,
        user.uid,
        user.displayName || 'Anonymous',
        file
      );

      setProgress(100);
      toast.success('AI Analysis Complete!');

      if (onNoteUploaded) {
        onNoteUploaded(noteData);
      }

      setTimeout(() => {
        setProgress(0);
        setProcessing(false);
        setUploading(false);
      }, 1500);
    } catch (error) {
      toast.error(error.message || 'Analysis failed');
      setProgress(0);
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <AnimatePresence mode="wait">
        {!uploading ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
              background: dragActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.05)' }}
          >
            <input
              id="file-input"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
            }}>
              <FaCloudUploadAlt style={{ color: 'var(--color-primary)' }} />
            </div>
            
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Upload Knowledge Source</h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px' }}>
                Drop PDFs, Docs or Text files. Our Gemini AI will instantly extract summaries and generate mastery flashcards.
              </p>
            </div>

            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              MAX FILE SIZE: 10MB
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{ padding: '4rem 2rem', textAlign: 'center' }}
          >
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ marginBottom: '2rem', position: 'relative', display: 'inline-block' }}>
                 <div className="spinner active" style={{ width: '80px', height: '80px', borderTopColor: 'var(--color-primary)' }} />
                 <FaBrain style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem', color: 'var(--color-primary)' }} />
              </div>
              <h2 style={{ marginBottom: '1rem' }}>{progress < 100 ? 'Synthesizing Content...' : 'Analysis Complete!'}</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                Analyzing your document with Gemini AI to extract core concepts and generate study material.
              </p>
              
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: 'var(--color-primary)', boxShadow: '0 0 15px var(--color-primary)' }}
                />
              </div>
              <p style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>{progress}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoteUploader;
