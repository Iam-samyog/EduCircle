import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import axios from 'axios';

const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || '/api';

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
 * Summarize note using AI backend
 * Now supports File objects (PDF, DOCX, TXT)
 */
export const summarizeNote = async (input) => {
  try {
    let response;
    
    if (input instanceof File) {
      const formData = new FormData();
      formData.append('file', input);
      response = await axios.post(`${AI_BACKEND_URL}/api/summarize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return { summary: response.data.summary, extractedText: response.data.extractedText };
    } else {
      // Legacy text support
      response = await axios.post(`${AI_BACKEND_URL}/api/summarize`, { text: input });
      return { summary: response.data.summary, extractedText: input };
    }
  } catch (error) {
    console.error('Error summarizing note:', error);
    throw error;
  }
};

/**
 * Generate flashcards using AI backend
 * Now supports File objects (PDF, DOCX, TXT)
 */
export const generateFlashcards = async (input) => {
  try {
    let response;
    
    if (input instanceof File) {
      const formData = new FormData();
      formData.append('file', input);
      response = await axios.post(`${AI_BACKEND_URL}/api/generate-flashcards`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await axios.post(`${AI_BACKEND_URL}/api/generate-flashcards`, { text: input });
    }
    
    return response.data.flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
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
    // Send file to backend for processing (extraction + AI)
    // Run in parallel for speed
    const [summaryResult, flashcards] = await Promise.all([
      summarizeNote(file),
      generateFlashcards(file)
    ]);
    
    const { summary, extractedText } = summaryResult;
    
    // Save to Firestore
    const noteData = await saveNoteData(roomId, userId, userName, {
      originalText: extractedText || "Text extracted from file",
      summary,
      flashcards,
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
