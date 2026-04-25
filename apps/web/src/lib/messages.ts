import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string | null>;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  lastSenderId: string;
  lastReadAt?: Record<string, Timestamp | null>;
  listingId?: string;
  listingTitle?: string;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp | null;
}

export interface UserInfo {
  id: string;
  name: string;
  photoURL?: string | null;
}

// Deterministic ID so the same pair of users always maps to one conversation.
export function getConversationId(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join('__');
}

export async function getOrCreateConversation(
  current: UserInfo,
  other: UserInfo,
  listing?: { id: string; title: string }
): Promise<string> {
  const id = getConversationId(current.id, other.id);
  const ref = doc(db, 'conversations', id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [current.id, other.id].sort(),
      participantNames: {
        [current.id]: current.name,
        [other.id]: other.name,
      },
      participantPhotos: {
        [current.id]: current.photoURL || null,
        [other.id]: other.photoURL || null,
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastSenderId: '',
      listingId: listing?.id || null,
      listingTitle: listing?.title || null,
      createdAt: serverTimestamp(),
    });
  } else {
    // Refresh own info in case name/photo changed since last time
    await updateDoc(ref, {
      [`participantNames.${current.id}`]: current.name,
      [`participantPhotos.${current.id}`]: current.photoURL || null,
      ...(listing && { listingId: listing.id, listingTitle: listing.title }),
    });
  }

  return id;
}

export function subscribeToConversations(
  userId: string,
  cb: (convos: Conversation[]) => void
) {
  // Sort client-side to avoid composite index requirement
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );
  return onSnapshot(q, (snap) => {
    const convos = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Conversation))
      .sort((a, b) => {
        const aMs = a.lastMessageAt?.toMillis?.() ?? 0;
        const bMs = b.lastMessageAt?.toMillis?.() ?? 0;
        return bMs - aMs;
      });
    cb(convos);
  });
}

export function subscribeToConversation(
  conversationId: string,
  cb: (convo: Conversation | null) => void
) {
  return onSnapshot(doc(db, 'conversations', conversationId), (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ id: snap.id, ...snap.data() } as Conversation);
  });
}

export function subscribeToMessages(
  conversationId: string,
  cb: (msgs: Message[]) => void
) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
  });
}

export async function sendMessage(
  conversationId: string,
  sender: UserInfo,
  text: string
) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId: sender.id,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
    lastSenderId: sender.id,
    [`participantNames.${sender.id}`]: sender.name,
    [`participantPhotos.${sender.id}`]: sender.photoURL || null,
    // Sender has obviously read everything up to their own message
    [`lastReadAt.${sender.id}`]: serverTimestamp(),
  });
}

export async function markConversationRead(conversationId: string, userId: string) {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`lastReadAt.${userId}`]: serverTimestamp(),
    });
  } catch {
    // ignore — conversation may not exist yet
  }
}

export function isConversationUnread(c: Conversation, userId: string) {
  if (!c.lastSenderId || c.lastSenderId === userId) return false;
  if (!c.lastMessageAt) return false;
  const readMs = c.lastReadAt?.[userId]?.toMillis?.() ?? 0;
  const lastMs = c.lastMessageAt.toMillis();
  return lastMs > readMs;
}
