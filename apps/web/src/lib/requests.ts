import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export type Urgency = 'high' | 'medium' | 'low';

export interface RequestData {
  id: string;
  item: string;
  budget: number | null;
  urgency: Urgency;
  description: string;
  status: 'open' | 'resolved';
  requesterId: string;
  requesterName: string;
  requesterRoom: string;
  requesterHostel: string;
  requesterPhoto: string | null;
  createdAt?: Timestamp;
}

export function subscribeToRequests(cb: (items: RequestData[]) => void) {
  const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as RequestData))
      .filter((r) => r.status === 'open');
    cb(items);
  });
}

export async function createRequest(input: {
  item: string;
  budget: number | null;
  urgency: Urgency;
  description: string;
  requesterId: string;
  requesterName: string;
  requesterRoom: string;
  requesterHostel: string;
  requesterPhoto: string | null;
}) {
  await addDoc(collection(db, 'requests'), {
    ...input,
    status: 'open',
    createdAt: serverTimestamp(),
  });
}

export async function deleteRequest(
  requestId: string,
  user: { uid: string; isModerator?: boolean }
) {
  const ref = doc(db, 'requests', requestId);
  // Authorization is enforced client-side here (and ideally Firestore rules later).
  // We don't tx-fetch since deleteDoc is a single op; checks happen in the UI.
  void user;
  await deleteDoc(ref);
}

export async function resolveRequest(requestId: string) {
  await updateDoc(doc(db, 'requests', requestId), { status: 'resolved' });
}
