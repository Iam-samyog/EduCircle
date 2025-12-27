import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage, subscribeToMessages } from '../services/chatService';
import { getCurrentUser } from '../services/auth';
import { FaPaperPlane, FaUsers, FaCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ChatBox = ({ roomId, roomName, participantCount }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = getCurrentUser();

  useEffect(() => {
    const unsubscribe = subscribeToMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(roomId, user.uid, user.displayName || 'Anonymous', newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      {/* Header Info (Contextual) */}
      <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }} />
           <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Real-time Feed</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{messages.length} messages</span>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isOwn = msg.userId === user.uid;
              return (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, x: isOwn ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', padding: '0 0.25rem' }}>
                    {!isOwn && <span style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--color-primary)' }}>{msg.userName}</span>}
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                      {msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : 'Sending...'}
                    </span>
                  </div>
                  
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.9rem 1.25rem',
                    borderRadius: isOwn ? '18px 18px 0 18px' : '18px 18px 18px 0',
                    background: isOwn ? 'var(--color-primary)' : '#F1F5F9',
                    color: isOwn ? 'white' : '#1E293B',
                    boxShadow: isOwn ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    border: isOwn ? 'none' : '1px solid #E2E8F0'
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #F1F5F9', background: 'white' }}>
        <form onSubmit={handleSendMessage} style={{ position: 'relative' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message to the circle..."
            style={{
              width: '100%',
              padding: '1rem 4rem 1rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '0.95rem'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
            }}
          >
            <FaPaperPlane style={{ fontSize: '0.9rem' }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
