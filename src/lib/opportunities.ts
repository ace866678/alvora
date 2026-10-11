import {
  collection,
  doc,
  onSnapshot,
  where,
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
  // Keep the query aligned with the public-read Firestore rule: only open and unverified listings.
  const listingsQuery = query(
    collection(requireDb(), "opportunities"),
    where("status", "in", ["open", "unverified"]),
  );
  return onSnapshot(
    listingsQuery,
    (snapshot) => {
      const records = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as OpportunityRecord);
      records.sort((a, b) => a.title.localeCompare(b.title));
      onData(records);
    },
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
