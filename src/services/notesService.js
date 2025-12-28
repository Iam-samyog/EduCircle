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
import axios from 'axios';

const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || '';

/**
 * Extract text from file (for now, assumes text files)
 */
export const extractTextFromFile = async (file) => {
  try {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // For PDF/DOCX, you would need additional libraries
    // For MVP, we'll just handle text files
    throw new Error('Only text files are supported in this version');
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
};

/**
 * Analyze note using unified AI backend
 */
export const analyzeContent = async (input) => {
  try {
    const formData = new FormData();
    if (input instanceof File) {
      formData.append('file', input);
    } else {
      formData.append('text', input);
    }

    const response = await axios.post(`${AI_BACKEND_URL}/api/ai/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
    console.error('AI Analysis Error:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Summarize note using AI backend
 */
export const summarizeNote = async (input) => {
  const data = await analyzeContent(input);
  return { summary: data.summary, extractedText: data.summary }; // Backend doesn't return raw text yet, using summary as placeholder or we can update backend
};

/**
 * Generate flashcards using AI backend
 */
export const generateFlashcards = async (input) => {
  const data = await analyzeContent(input);
  return data.flashcards;
};

/**
 * Save note data to Firestore
 */
export const saveNoteData = async (roomId, userId, userName, noteData) => {
  try {
    const notesRef = collection(db, 'notes');
    
    const data = {
      roomId,
      uploadedBy: userId,
      uploadedByName: userName,
      originalText: noteData.originalText,
      summary: noteData.summary,
      flashcards: noteData.flashcards,
      fileName: noteData.fileName,
      uploadedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notesRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error saving note data:', error);
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
 * Process note: extract text, summarize, and generate flashcards
 * Supports PDF, DOCX, TXT via backend processing
 */
export const processNote = async (roomId, userId, userName, file) => {
  try {
    // Single AI call for both summary and flashcards
    const data = await analyzeContent(file);
    
    const { summary, flashcards, keyPoints } = data;
    
    // Save to Firestore
    const noteData = await saveNoteData(roomId, userId, userName, {
      originalText: "Extracted from " + file.name,
      summary,
      flashcards,
      keyPoints, // Adding keypoints support too
      fileName: file.name
    });
    
    return noteData;
  } catch (error) {
    console.error('Error processing note:', error);
    throw error;
  }
};

/**
 * Update note summary
 */
export const updateNoteSummary = async (noteId, newSummary) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      summary: newSummary,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating summary:', error);
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
