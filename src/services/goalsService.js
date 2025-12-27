import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Create a new study goal
 */
export const createGoal = async (roomId, goalData) => {
  try {
    const goalsRef = collection(db, 'goals');
    
    const data = {
      roomId,
      goalName: goalData.goalName,
      assignedTo: goalData.assignedTo,
      assignedToName: goalData.assignedToName,
      progress: 0,
      deadline: goalData.deadline,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(goalsRef, data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

/**
 * Update goal progress
 */
export const updateGoalProgress = async (goalId, progress) => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, { progress });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    throw error;
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (goalId) => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

/**
 * Get goals for a room
 */
export const getGoalsByRoom = async (roomId) => {
  try {
    const goalsQuery = query(
      collection(db, 'goals'),
      where('roomId', '==', roomId)
    );
    
    const snapshot = await getDocs(goalsQuery);
    const goals = [];
    
    snapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    return goals;
  } catch (error) {
    console.error('Error getting goals:', error);
    throw error;
  }
};

/**
 * Subscribe to goals in a room
 */
export const subscribeToGoals = (roomId, callback) => {
  const goalsQuery = query(
    collection(db, 'goals'),
    where('roomId', '==', roomId)
  );
  
  return onSnapshot(goalsQuery, (snapshot) => {
    const goals = [];
    snapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    callback(goals);
  });
};

/**
 * Mark goal as complete
 */
export const markGoalComplete = async (goalId) => {
  try {
    await updateGoalProgress(goalId, 100);
  } catch (error) {
    console.error('Error marking goal complete:', error);
    throw error;
  }
};
