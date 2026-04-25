import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  hostelName: string;
  roomNumber: string;
  email: string;
  photoURL: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

export function subscribeToProfile(
  uid: string,
  cb: (profile: UserProfile | null) => void
) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ uid: snap.id, ...snap.data() } as UserProfile);
  });
}

export async function saveProfile(profile: {
  uid: string;
  name: string;
  hostelName: string;
  roomNumber: string;
  email: string;
  photoURL: string | null;
}) {
  await setDoc(
    doc(db, 'users', profile.uid),
    {
      name: profile.name.trim(),
      hostelName: profile.hostelName.trim(),
      roomNumber: profile.roomNumber.trim(),
      email: profile.email,
      photoURL: profile.photoURL,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}
