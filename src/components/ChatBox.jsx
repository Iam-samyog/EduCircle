import { useState, useEffect, useRef } from 'react';
import { sendMessage, subscribeToMessages } from '../services/chatService';
import { getCurrentUser } from '../services/auth';
import { FaPaperPlane, FaUsers } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ChatBox = ({ roomId, roomName, participantCount }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = getCurrentUser();

  // ... (useEffect hooks match existing)

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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      console.error('Error sending message:', error);
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
    <div className="flex flex-col" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Floating Chat Header */}
      <div className="chat-header" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.5rem 2rem',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
         <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: 0, color: 'var(--color-primary-dark)' }}>{roomName || 'Chat'}</h2>
         <div className="flex items-center gap-sm text-secondary">
            <FaUsers />
            <span style={{ fontSize: '0.9rem' }}>{participantCount || 0} active</span>
         </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '6rem 1rem 2rem 1rem', // Added top padding for header
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        background: '#F9FAFB'
      }}>
        {messages.length === 0 ? (
          <div className="empty-state flex flex-col items-center justify-center h-full text-muted">
             <span style={{ fontSize: '3rem', opacity: 0.3 }}>💬</span>
             <p style={{ marginTop: '1rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#6B7280' }}>Start the conversation</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.userId === user.uid;
            
            // Simplified grouping logic
            const showHeader = !isOwnMessage && (index === 0 || messages[index - 1].userId !== message.userId);

            return (
              <div
                key={message.id}
                className="flex flex-col animate-slideUp"
                style={{
                  alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                  marginBottom: '0.5rem'
                }}
              >
                {/* Sender Name */}
                <span style={{ 
                   fontSize: '0.85rem', 
                   color: '#6B7280', 
                   marginBottom: '0.25rem',
                   marginRight: isOwnMessage ? '1rem' : '0',
                   marginLeft: isOwnMessage ? '0' : '1rem',
                   fontWeight: 500
                }}>
                  {message.userName}
                </span>

                {/* Message Bubble */}
                <div className="message-bubble" style={{
                  maxWidth: '70%',
                  padding: '1.25rem 1.5rem',
                  background: isOwnMessage ? 'var(--color-primary)' : '#FFFFFF',
                  color: isOwnMessage ? '#FFFFFF' : '#1F2937',
                  border: isOwnMessage ? 'none' : '1px solid #E5E7EB',
                  borderRadius: isOwnMessage ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                  boxShadow: isOwnMessage ? '0 4px 10px rgba(0, 0, 0, 0.1)' : '0 2px 5px rgba(0,0,0,0.03)',
                  fontSize: '1.1rem',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  position: 'relative'
                }}>
                  {message.text}
                </div>

                {/* Timestamp */}
                <span style={{ 
                   fontSize: '0.75rem', 
                   color: '#9CA3AF', 
                   marginTop: '0.1rem',
                   marginRight: isOwnMessage ? '1rem' : '0',
                   marginLeft: isOwnMessage ? '0' : '1rem'
                }}>
                  {formatMessageTime(message.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Minimalist Underline */}
      <form 
        className="chat-input-form"
        onSubmit={handleSendMessage}
        style={{ 
          padding: '1.5rem',
          borderTop: '1px solid #E5E7EB',
          background: '#FFFFFF',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex items-center gap-md">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            style={{ 
              flex: 1,
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '2rem',
              color: '#1F2937',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
            }}
          >
            {sending ? <div className="spinner spinner-sm" style={{ borderTopColor: 'white', borderLeftColor: 'white' }}></div> : <FaPaperPlane />}
          </button>
        </div>
      </form>
      <style>{`
        @media (max-width: 768px) {
          .chat-header {
            padding: 1rem !important;
          }
          .chat-header h2 {
            font-size: 1.1rem !important;
          }
          .messages-area {
            padding-top: 5rem !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          .message-bubble {
            max-width: 85% !important;
            padding: 1rem 1.25rem !important;
            font-size: 1rem !important;
          }
          .chat-input-form {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
