import { useState } from 'react';
import { processNote } from '../services/notesService';
import { getCurrentUser } from '../services/auth';
import { FaUpload, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
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
    // Validate file type
    const validTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    // We also check extension because sometimes mime type is empty or incorrect
    const validExtensions = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error('Supported formats: .txt, .pdf, .doc, .docx');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate progress for upload
      setProgress(20);
      toast.loading('Uploading note...', { id: 'upload' });

      setProgress(40);
      setProcessing(true);
      toast.loading('Processing with AI...', { id: 'upload' });

      setProgress(60);
      const noteData = await processNote(
        roomId,
        user.uid,
        user.displayName || 'Anonymous',
        file
      );

      setProgress(100);
      toast.success('Note processed successfully!', { id: 'upload' });

      if (onNoteUploaded) {
        onNoteUploaded(noteData);
      }

      // Reset after a delay
      setTimeout(() => {
        setProgress(0);
        setProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing note:', error);
      toast.error(error.message || 'Failed to process note', { id: 'upload' });
      setProgress(0);
      setProcessing(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        className={`glass uploader-container ${dragActive ? 'animate-glow' : ''}`}
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--glass-border)'}`,
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)'
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
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        {uploading ? (
          <div>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p className="text-lg font-semibold">
              {processing ? 'Processing with AI...' : 'Uploading...'}
            </p>
            <div className="progress progress-lg" style={{ maxWidth: '300px', margin: '1rem auto 0' }}>
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
              {progress}%
            </p>
          </div>
        ) : (
          <div>
            <FaUpload style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }} />
            <p className="text-lg font-semibold" style={{ marginBottom: '0.5rem' }}>
              Drop your notes here or click to browse
            </p>
            <p className="text-sm text-muted">
              Supports .txt, .pdf, .docx (up to 10MB)
            </p>
            <p className="text-sm text-muted" style={{ marginTop: '1rem' }}>
              AI will automatically summarize and generate flashcards
            </p>
          </div>
        )}
      </div>

      {progress === 100 && (
        <div className="flex items-center justify-center gap-sm animate-slideUp" style={{ marginTop: '1rem' }}>
          <FaCheckCircle style={{ color: 'var(--color-success)', fontSize: '1.5rem' }} />
          <p className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
            Note processed successfully!
          </p>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .uploader-container {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NoteUploader;
