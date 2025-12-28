import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTrash, FaTimes } from 'react-icons/fa';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" // 'danger' | 'warning' | 'info'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="modal"
            style={{ 
              maxWidth: '400px', 
              padding: '2rem',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              borderRadius: '24px',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: type === 'danger' ? '#fef2f2' : '#fff7ed', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: type === 'danger' ? '#ef4444' : '#f59e0b'
            }}>
              <FaExclamationTriangle style={{ fontSize: '1.5rem' }} />
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#111827', fontWeight: 600 }}>{title}</h3>
            <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.5' }}>{message}</p>

            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button 
                className="btn btn-ghost" 
                onClick={onClose}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#f3f4f6', border: 'none', color: '#374151' }}
              >
                {cancelText}
              </button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn" 
                onClick={onConfirm}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  borderRadius: '12px', 
                  background: type === 'danger' ? '#ef4444' : '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  fontWeight: 600,
                  boxShadow: type === 'danger' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(37, 99, 235, 0.2)'
                }}
              >
                 {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
