import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName: name });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      name: name,
      email: email,
      photoURL: user.photoURL || '',
      createdAt: new Date()
    });
    
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    // Create user document if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    
    // Update Firebase Auth profile if name or photoURL changed
    if (data.name || data.photoURL) {
      const updates = {};
      if (data.name) updates.displayName = data.name;
      if (data.photoURL) updates.photoURL = data.photoURL;
      await updateProfile(auth.currentUser, updates);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};
