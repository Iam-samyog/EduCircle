import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Send a message to a room
 */
export const sendMessage = async (roomId, userId, userName, text, userPhotoURL = '') => {
  try {
    const messagesRef = collection(db, 'messages');
    
    const messageData = {
      roomId,
      userId,
      userName,
      userPhotoURL,
      text,
      timestamp: serverTimestamp()
    };
    
    await addDoc(messagesRef, messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Subscribe to messages in a room
 */
/**
 * Subscribe to messages in a room
 * NOTE: Sorting is done client-side to avoid needing a Firestore composite index
 */
export const subscribeToMessages = (roomId, callback) => {
  const messagesQuery = query(
    collection(db, 'messages'),
    where('roomId', '==', roomId)
    // Removed orderBy to avoid "requires an index" error
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    // Client-side sort by timestamp
    messages.sort((a, b) => {
      const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
      const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
      return timeA - timeB;
    });
    
    callback(messages);
  });
};

/**
 * Get message history with limit
 */
export const getMessageHistory = async (roomId, messageLimit = 50) => {
  try {
    const messagesRef = collection(db, 'messages');
    
    try {
      const historyQuery = query(
        messagesRef,
        where('roomId', '==', roomId),
        orderBy('timestamp', 'desc'),
        limit(messageLimit)
      );
      const snapshot = await getDocs(historyQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
    } catch (indexError) {
      console.warn('Chat history index missing, falling back');
      const simpleQuery = query(
        messagesRef,
        where('roomId', '==', roomId),
        limit(messageLimit)
      );
      const snapshot = await getDocs(simpleQuery);
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side sort
      messages.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0);
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0);
        return timeA - timeB;
      });
      
      return messages;
    }
  } catch (error) {
    console.error('Error getting message history:', error);
    throw error;
  }
};
