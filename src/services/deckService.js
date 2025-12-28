import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Create a new deck for a room
 */
export const createDeck = async (roomId, userId, userName, title) => {
  try {
    const decksRef = collection(db, 'decks');
    
    const data = {
      roomId,
      createdBy: userId,
      createdByName: userName || 'Anonymous',
      title: title || 'Untitled Deck',
      flashcards: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(decksRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error creating deck:', error);
    throw error;
  }
};

/**
 * Get decks for a room
 */
export const getDecksByRoom = async (roomId) => {
  try {
    const decksQuery = query(
      collection(db, 'decks'),
      where('roomId', '==', roomId)
    );
    
    const snapshot = await getDocs(decksQuery);
    const decks = [];
    
    snapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });
    
    // Client-side sort: handle pending timestamps
    return decks.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now());
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now());
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error getting decks:', error);
    throw error;
  }
};

/**
 * Subscribe to decks in a room
 */
export const subscribeToDecks = (roomId, callback) => {
  const decksRef = collection(db, 'decks');
  
  // Stable query without orderBy to bypass index requirements and SDK bugs
  const simpleQuery = query(
    decksRef,
    where('roomId', '==', roomId)
  );

  return onSnapshot(simpleQuery, (snapshot) => {
    const decks = [];
    snapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort on client side: handle pending timestamps by treating missing/pending as now
    decks.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now());
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now());
      return timeB - timeA;
    });
    
    callback(decks);
  }, (error) => {
    console.error('Subscription error:', error);
    toast.error('Sync failed. Please check your connection.');
  });
};

/**
 * Update deck title
 */
export const updateDeckTitle = async (deckId, userId, newTitle) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    const deckDoc = await getDoc(deckRef);
    
    if (!deckDoc.exists()) throw new Error('Deck not found');
    if (deckDoc.data().createdBy !== userId) throw new Error('Permission denied');

    await updateDoc(deckRef, {
      title: newTitle,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    throw error;
  }
};

/**
 * Delete a deck
 */
export const deleteDeck = async (deckId, userId) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    const deckDoc = await getDoc(deckRef);
    
    if (!deckDoc.exists()) return;
    if (deckDoc.data().createdBy !== userId) throw new Error('Permission denied');

    await deleteDoc(deckRef);
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
};

/**
 * Update flashcards for a deck
 */
export const updateDeckFlashcards = async (deckId, userId, flashcards) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    const deckDoc = await getDoc(deckRef);
    
    if (!deckDoc.exists()) throw new Error('Deck not found');
    if (deckDoc.data().createdBy !== userId) throw new Error('Permission denied');

    await updateDoc(deckRef, {
      flashcards,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating flashcards:', error);
    throw error;
  }
};

/**
 * Add a single flashcard to a deck
 */
export const addFlashcardToDeck = async (deckId, userId, flashcard) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    const deckDoc = await getDoc(deckRef);
    
    if (!deckDoc.exists()) throw new Error('Deck not found');
    if (deckDoc.data().createdBy !== userId) throw new Error('Permission denied');

    const currentFlashcards = deckDoc.data().flashcards || [];
    
    await updateDoc(deckRef, {
      flashcards: [...currentFlashcards, flashcard],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding flashcard:', error);
    throw error;
  }
};
