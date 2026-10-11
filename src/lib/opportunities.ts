import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type OpportunityRecord = {
  id: string;
  title: string;
  organization: string;
  category: "Scholarships" | "Internships" | "Hackathons" | "Grants" | "Competitions" | "Events";
  description: string;
  deadline: string | null;
  deadlineAt: string | null;
  value: string | null;
  location: string;
  format: "Online" | "On-site" | "Hybrid";
  tags: string[];
  eligibility: string[];
  sourceUrl: string;
  applicationUrl: string | null;
  verifiedAt: string | null;
  status: "open" | "closed" | "unverified";
};

function requireDb() {
  if (!db) {
    throw new Error("Firebase is not configured yet. Add the VITE_FIREBASE_* values to your environment.");
  }
  return db;
}

/** Listen to published listings. Firestore security rules should allow public reads only. */
export function subscribeToOpportunities(
  onData: (items: OpportunityRecord[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const listingsQuery = query(collection(requireDb(), "opportunities"), orderBy("title"));
  return onSnapshot(
    listingsQuery,
    (snapshot) => onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as OpportunityRecord)),
    (error) => onError?.(error),
  );
}

/** Save a listing under the signed-in user's private subcollection. */
export async function saveOpportunity(userId: string, opportunityId: string) {
  await setDoc(doc(requireDb(), "users", userId, "savedOpportunities", opportunityId), {
    opportunityId,
    savedAt: serverTimestamp(),
  });
}

export async function unsaveOpportunity(userId: string, opportunityId: string) {
  await deleteDoc(doc(requireDb(), "users", userId, "savedOpportunities", opportunityId));
}

export function subscribeToSavedOpportunities(
  userId: string,
  onData: (ids: string[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(requireDb(), "users", userId, "savedOpportunities"),
    (snapshot) => onData(snapshot.docs.map((item) => item.id)),
    (error) => onError?.(error),
  );
}
