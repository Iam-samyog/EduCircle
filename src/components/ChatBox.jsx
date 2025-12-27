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
    const unsubscribe = subscribeToMessages(roomId, (serverMessages) => {
      setMessages(currentMessages => {
        const pendingMessages = currentMessages.filter(m => m.pending);
        const stillPending = pendingMessages.filter(pm => 
          !serverMessages.some(sm => sm.text === pm.text && sm.userId === pm.userId)
        );
        return [...serverMessages, ...stillPending];
      });
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    const tempId = 'temp-' + Date.now();
    const optimisticMessage = {
      id: tempId,
      text: messageText,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhotoURL: user.photoURL || '',
      timestamp: new Date(),
      pending: true
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await sendMessage(roomId, user.uid, user.displayName || 'Anonymous', messageText, user.photoURL || '');
    } catch (error) {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageText);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'h:mm a');
      } else if (timestamp instanceof Date) {
        return format(timestamp, 'h:mm a');
      } else if (timestamp && timestamp.seconds) {
        return format(new Date(timestamp.seconds * 1000), 'h:mm a');
      }
      return format(new Date(), 'h:mm a'); 
    } catch (e) {
      return '';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      
      {/* Messages Area */}
      <div className="custom-scrollbar" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
             <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
             <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>The channel is clear. Start studying!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.userId === user.uid;
            const isNextFromSame = index < messages.length - 1 && messages[index+1].userId === message.userId;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: isOwnMessage ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  marginBottom: isNextFromSame ? '-1.5rem' : '0'
                }}
              >
                {!isOwnMessage && (index === 0 || messages[index - 1].userId !== message.userId) && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-primary-light)', marginBottom: '0.5rem', marginLeft: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {message.userName}
                  </span>
                )}

                <div style={{
                  maxWidth: '75%',
                  padding: '1rem 1.5rem',
                  background: isOwnMessage ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                  border: isOwnMessage ? 'none' : '1px solid var(--glass-border)',
                  color: 'white',
                  borderRadius: isOwnMessage ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  boxShadow: isOwnMessage ? 'var(--shadow-glow)' : 'none',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  wordBreak: 'break-word',
                  position: 'relative'
                }}>
                  {message.text}
                </div>

                {!isNextFromSame && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>
                    {formatMessageTime(message.timestamp)}
                  </span>
                )}
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
        <form onSubmit={handleSendMessage} className="flex gap-md">
          <input
            type="text"
            placeholder="Type your message to the circle..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ 
              flex: 1,
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary"
            style={{ width: '56px', height: '56px', borderRadius: '12px', padding: 0 }}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
