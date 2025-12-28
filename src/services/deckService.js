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
      createdByName: userName,
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
      where('roomId', '==', roomId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(decksQuery);
    const decks = [];
    
    snapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });
    
    return decks;
  } catch (error) {
    console.error('Error getting decks:', error);
    throw error;
  }
};

/**
 * Subscribe to decks in a room
 */
export const subscribeToDecks = (roomId, callback) => {
  const decksQuery = query(
    collection(db, 'decks'),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(decksQuery, (snapshot) => {
    const decks = [];
    snapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });
    callback(decks);
  }, (error) => {
    console.error('Error subscribing to decks:', error);
  });
};

/**
 * Update deck title
 */
export const updateDeckTitle = async (deckId, newTitle) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
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
export const deleteDeck = async (deckId) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    await deleteDoc(deckRef);
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
};

/**
 * Update flashcards for a deck
 */
export const updateDeckFlashcards = async (deckId, flashcards) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
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
export const addFlashcardToDeck = async (deckId, flashcard) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    const deckSnapshot = await getDocs(query(collection(db, 'decks'), where('__name__', '==', deckId)));
    
    if (deckSnapshot.empty) {
      throw new Error('Deck not found');
    }

    const deckData = deckSnapshot.docs[0].data();
    const currentFlashcards = deckData.flashcards || [];
    
    await updateDoc(deckRef, {
      flashcards: [...currentFlashcards, flashcard],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding flashcard:', error);
    throw error;
  }
};
