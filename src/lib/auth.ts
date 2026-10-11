import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

function requireAuth() {
  if (!auth) {
    throw new Error("Firebase is not configured yet. Add the VITE_FIREBASE_* values to your environment.");
  }
  return auth;
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(requireAuth(), googleProvider);
export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(requireAuth(), email, password);
export const createEmailAccount = (email: string, password: string) =>
  createUserWithEmailAndPassword(requireAuth(), email, password);
export const sendPasswordReset = (email: string) => sendPasswordResetEmail(requireAuth(), email.trim());
export const signOutUser = () => signOut(requireAuth());

export type AlvoraUser = User;
