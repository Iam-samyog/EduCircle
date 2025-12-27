import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generate a unique room ID
 */
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Create a new study room
 */
export const createRoom = async (roomName, userId, userName) => {
  try {
    const roomId = generateRoomId();
    const roomRef = doc(db, 'rooms', roomId);
    
    const roomData = {
      roomId,
      roomName,
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp(),
      participants: [userId],
      participantDetails: [{
        userId,
        name: userName,
        role: 'admin',
        joinedAt: new Date()
      }],
      joinRequests: [],
      isPublic: true,
    };
    
    await setDoc(roomRef, roomData);
    return { roomId, ...roomData };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Join an existing room
 */
export const joinRoom = async (roomId, userId, userName) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);
    
    if (!roomDoc.exists()) {
      throw new Error('Room not found');
    }
    
    const roomData = roomDoc.data();
    
    // Check if user is already a participant
    if (roomData.participants.includes(userId)) {
      return { roomId, ...roomData };
    }
    
    // Add user to participants
    await updateDoc(roomRef, {
      participants: arrayUnion(userId),
      participantDetails: arrayUnion({
        userId,
        name: userName,
        role: 'member',
        joinedAt: new Date()
      })
    });
    
    return { roomId, ...roomData };
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

/**
 * Leave a room
 */
export const leaveRoom = async (roomId, userId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      participants: arrayRemove(userId)
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};

/**
 * Get room by ID
 */
export const getRoomById = async (roomId) => {
  try {
    const roomDoc = await getDoc(doc(db, 'rooms', roomId));
    if (roomDoc.exists()) {
      return { roomId, ...roomDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting room:', error);
    throw error;
  }
};

/**
 * Get all rooms for a user
 */
export const getRoomsByUser = async (userId) => {
  try {
    const roomsQuery = query(
      collection(db, 'rooms'),
      where('participants', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(roomsQuery);
    const rooms = [];
    
    querySnapshot.forEach((doc) => {
      rooms.push({ roomId: doc.id, ...doc.data() });
    });
    
    return rooms;
  } catch (error) {
    console.error('Error getting user rooms:', error);
    throw error;
  }
};

/**
 * Generate shareable room link
 */
export const generateRoomLink = (roomId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/room/${roomId}`;
};

/**
 * Subscribe to room updates
 */
export const subscribeToRoom = (roomId, callback) => {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback({ roomId: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

/**
 * Update room details
 */
export const updateRoom = async (roomId, updates) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, updates);
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

/**
 * Get all public rooms (explore)
 */
export const getPublicRooms = async () => {
  try {
    const roomsQuery = query(
      collection(db, 'rooms'),
      limit(50)
    );
    
    // Fetch all recent rooms to ensure we see them, even if 'isPublic' is missing.
    // We filter client-side.
    const querySnapshot = await getDocs(roomsQuery);
    const rooms = [];
    
    querySnapshot.forEach((doc) => {
      rooms.push({ roomId: doc.id, ...doc.data() });
    });
    
    return rooms;
  } catch (error) {
    console.error('Error getting public rooms:', error);
    throw error;
  }
};

/**
 * Request to join a room
 */
export const requestJoin = async (roomId, userId, userName) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      joinRequests: arrayUnion({
        userId,
        userName,
        requestedAt: new Date()
      })
    });
  } catch (error) {
    console.error('Error requesting to join:', error);
    throw error;
  }
};

/**
 * Approve a join request
 */
export const approveJoinRequest = async (roomId, request) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    
    await updateDoc(roomRef, {
      joinRequests: arrayRemove(request),
      participants: arrayUnion(request.userId),
      participantDetails: arrayUnion({
        userId: request.userId,
        name: request.userName,
        role: 'member',
        joinedAt: new Date()
      })
    });
  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
};

/**
 * Reject a join request
 */
export const rejectJoinRequest = async (roomId, request) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      joinRequests: arrayRemove(request)
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw error;
  }
};

/**
 * Update participant role
 */
export const updateParticipantRole = async (roomId, userId, newRole, currentDetails) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const updatedDetails = currentDetails.map(p => 
      p.userId === userId ? { ...p, role: newRole } : p
    ); // Filter out or update

    await updateDoc(roomRef, {
      participantDetails: updatedDetails
    });
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

/**
 * Delete a room
 */
export const deleteRoom = async (roomId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await deleteDoc(roomRef);
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};
