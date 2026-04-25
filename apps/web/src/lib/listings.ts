import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';

export interface ListingData {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRoom: string;
  status: 'active' | 'auction' | 'sold';
  auctionEndsAt?: Timestamp;
  currentBid?: number;
  currentBidderId?: string;
  currentBidderName?: string;
  currentBidderRoom?: string;
  winnerId?: string;
  winnerName?: string;
  finalPrice?: number;
  viewsCount: number;
}

export interface BidData {
  id: string;
  userId: string;
  userName: string;
  userRoom?: string;
  amount: number;
  createdAt: Timestamp;
}

export const AUCTION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
export const MIN_BID_INCREMENT = 1;

export function getCurrentUser() {
  if (typeof window === 'undefined') return { id: 'anon', name: 'Anonymous' };
  const id = localStorage.getItem('hostelmart_user_id') || 'anon';
  const name = localStorage.getItem('hostelmart_user_name') || 'Anonymous';
  return { id, name };
}

export function subscribeToListings(cb: (items: ListingData[]) => void) {
  // Filter client-side to avoid needing a composite index in Firestore
  const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as ListingData))
      .filter((item) => item.status === 'active' || item.status === 'auction');
    cb(items);
  });
}

export function subscribeToMyListings(
  sellerId: string,
  cb: (items: ListingData[]) => void
) {
  const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as ListingData))
      .filter((item) => item.sellerId === sellerId);
    cb(items);
  });
}

export function subscribeToListing(id: string, cb: (item: ListingData | null) => void) {
  return onSnapshot(doc(db, 'listings', id), (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ id: snap.id, ...snap.data() } as ListingData);
  });
}

export function subscribeToBids(listingId: string, cb: (bids: BidData[]) => void) {
  const q = query(
    collection(db, 'listings', listingId, 'bids'),
    orderBy('amount', 'desc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BidData)));
  });
}

interface BidUser {
  id: string;
  name: string;
  room?: string;
}

// Buy a listing. If quantity > 1, just decrement. If it's the last item,
// trigger a 5-minute auction with the buyer as the provisional winner.
export async function buyListing(listingId: string, user: BidUser) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'listings', listingId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Listing not found');
    const data = snap.data();
    if (data.status !== 'active') throw new Error('Not available');

    if (data.quantity > 1) {
      tx.update(ref, { quantity: data.quantity - 1 });
    } else {
      const endsAt = Timestamp.fromMillis(Date.now() + AUCTION_DURATION_MS);
      tx.update(ref, {
        status: 'auction',
        auctionEndsAt: endsAt,
        currentBid: data.price,
        currentBidderId: user.id,
        currentBidderName: user.name,
        currentBidderRoom: user.room || null,
      });
    }
  });
}

export async function placeBid(listingId: string, user: BidUser, amount: number) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'listings', listingId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Listing not found');
    const data = snap.data();
    if (data.status !== 'auction') throw new Error('Auction is not live');
    if (data.auctionEndsAt && data.auctionEndsAt.toMillis() < Date.now()) {
      throw new Error('Auction has ended');
    }
    if (amount < (data.currentBid || 0) + MIN_BID_INCREMENT) {
      throw new Error(`Bid must be at least ₹${(data.currentBid || 0) + MIN_BID_INCREMENT}`);
    }
    tx.update(ref, {
      currentBid: amount,
      currentBidderId: user.id,
      currentBidderName: user.name,
      currentBidderRoom: user.room || null,
    });
  });
  await addDoc(collection(db, 'listings', listingId, 'bids'), {
    userId: user.id,
    userName: user.name,
    userRoom: user.room || null,
    amount,
    createdAt: serverTimestamp(),
  });
}

export async function deleteListing(listingId: string, sellerId: string) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'listings', listingId);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Listing not found');
    const data = snap.data();
    if (data.sellerId !== sellerId) throw new Error('Not authorized');
    if (data.status === 'auction') throw new Error('Cannot delete during a live auction');
    tx.delete(ref);
  });
}

// Called client-side when the timer expires. Idempotent — safe to call multiple times.
export async function finalizeAuction(listingId: string) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'listings', listingId);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.status !== 'auction') return;
    if (data.auctionEndsAt && data.auctionEndsAt.toMillis() > Date.now()) return;

    tx.update(ref, {
      status: 'sold',
      winnerId: data.currentBidderId || null,
      winnerName: data.currentBidderName || null,
      finalPrice: data.currentBid || data.price,
    });
  });
}
