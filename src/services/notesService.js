import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Save a new note to Firestore (no AI processing)
 */
export const saveNote = async (roomId, userId, userName, noteData) => {
  try {
    const notesRef = collection(db, 'notes');
    
    const data = {
      roomId,
      uploadedBy: userId,
      uploadedByName: userName,
      content: noteData.content || '',
      fileName: noteData.fileName || null,
      flashcards: noteData.flashcards || [],
      uploadedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notesRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

/**
 * Get notes for a room
 */
export const getNotesByRoom = async (roomId) => {
  try {
    const notesQuery = query(
      collection(db, 'notes'),
      where('roomId', '==', roomId)
    );
    
    const snapshot = await getDocs(notesQuery);
    const notes = [];
    
    snapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    
    return notes;
  } catch (error) {
    console.error('Error getting notes:', error);
    throw error;
  }
};

/**
 * Update note content
 */
export const updateNoteContent = async (noteId, newContent) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      content: newContent,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

/**
 * Delete a note from Firestore
 */
export const deleteNote = async (noteId) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

/**
 * Update flashcards for a note
 */
export const updateNoteFlashcards = async (noteId, flashcards) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      flashcards,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating flashcards:', error);
    throw error;
  }
};

/**
 * Add a single flashcard to a note
 */
export const addFlashcardToNote = async (noteId, flashcard) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    const notesQuery = query(collection(db, 'notes'), where('__name__', '==', noteId));
    const snapshot = await getDocs(notesQuery);
    
    if (snapshot.empty) {
      throw new Error('Note not found');
    }

    const noteDoc = snapshot.docs[0];
    const currentFlashcards = noteDoc.data().flashcards || [];
    
    await updateDoc(noteRef, {
      flashcards: [...currentFlashcards, flashcard],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding flashcard:', error);
    throw error;
  }
};
