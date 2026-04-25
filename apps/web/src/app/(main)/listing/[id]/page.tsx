'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  subscribeToListing,
  subscribeToBids,
  buyListing,
  placeBid,
  finalizeAuction,
  MIN_BID_INCREMENT,
  type ListingData,
  type BidData,
} from '@/lib/listings';
import { getOrCreateConversation } from '@/lib/messages';
import { useAuth } from '@/components/UserProvider';

// ── Icons (Lucide-style strokes) ─────────────────────
const IconSearch = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const IconPackage = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.55 4.24"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" x2="12" y1="22" y2="12"/>
  </svg>
);

const IconFlame = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const IconCheckCircle = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

function formatTime(ms: number) {
  if (ms <= 0) return '0:00';
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const id = params?.id;

  const [listing, setListing] = useState<ListingData | null>(null);
  const [bids, setBids] = useState<BidData[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [bidInput, setBidInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoModal, setInfoModal] = useState<{ icon: 'flame' | 'check'; title: string; body: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToListing(id, (data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setListing(data);
        setNotFound(false);
      }
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToBids(id, setBids);
    return () => unsub();
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!listing || !id) return;
    if (listing.status !== 'auction') return;
    const endsAt = listing.auctionEndsAt?.toMillis();
    if (endsAt && endsAt <= now) {
      finalizeAuction(id).catch((e) => console.error(e));
    }
  }, [listing, now, id]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 gap-4">
        <div className="w-20 h-20 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#9CA3AF]">
          <IconSearch size={36} />
        </div>
        <h1 className="text-xl font-bold text-[#0A0E1A]">Listing not found</h1>
        <button onClick={() => router.push('/')} className="text-[#0062FF] font-semibold text-sm">
          Back to marketplace
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-[#9CA3AF]">Loading...</span>
      </div>
    );
  }

  const isAuction = listing.status === 'auction';
  const isSold = listing.status === 'sold';
  const endsAtMs = listing.auctionEndsAt?.toMillis() ?? 0;
  const timeLeft = Math.max(0, endsAtMs - now);
  const isCurrentBidder = listing.currentBidderId === user?.uid;
  const isSeller = listing.sellerId === user?.uid;
  const minNextBid = (listing.currentBid || listing.price) + MIN_BID_INCREMENT;

  const handleBuy = async () => {
    if (isSeller) {
      setErrorMsg('You cannot buy your own listing');
      return;
    }
    if (!user || !profile) return;
    const currentUser = { id: user.uid, name: profile.name, room: profile.roomNumber };
    setSubmitting(true);
    setErrorMsg('');
    try {
      await buyListing(listing.id, currentUser);
      if (listing.quantity === 1) {
        setInfoModal({
          icon: 'flame',
          title: 'Auction started!',
          body: "This was the last item. A 5-minute auction has begun — others can place higher bids to outprice you. You're leading for now.",
        });
      } else {
        setInfoModal({
          icon: 'check',
          title: 'Purchased!',
          body: 'The seller will message you shortly to arrange delivery.',
        });
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to buy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBid = async () => {
    const amount = Number(bidInput);
    if (!amount || Number.isNaN(amount)) {
      setErrorMsg('Enter a valid bid');
      return;
    }
    if (isSeller) {
      setErrorMsg('You cannot bid on your own listing');
      return;
    }
    if (!user || !profile) return;
    const currentUser = { id: user.uid, name: profile.name, room: profile.roomNumber };
    setSubmitting(true);
    setErrorMsg('');
    try {
      await placeBid(listing.id, currentUser, amount);
      setBidInput('');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  const imageSrc = listing.images?.[0];

  return (
    <div className="flex flex-col md:px-8 md:pt-4">

      {/* ── Hero ─────────────────────────────────── */}
      <div className="relative bg-[#F5F6F8] pt-4 pb-8 px-5 md:rounded-[20px]">
        <button
          onClick={() => router.back()}
          className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-sm mb-6 hover:shadow-md transition-shadow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
          </svg>
        </button>

        <div className="flex items-center justify-center py-6">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={listing.title} className="max-h-[240px] rounded-[14px] object-contain" />
          ) : (
            <div className="text-[#9CA3AF]">
              <IconPackage size={80} />
            </div>
          )}
        </div>
      </div>

      {/* ── Info ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 px-5 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#0062FF] tracking-[0.5px] uppercase">
              {listing.category}
            </span>
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#0A0E1A] tracking-[-0.5px]">
              {listing.title}
            </h1>
            <span className="text-sm text-[#9CA3AF]">
              {isSold
                ? 'Sold'
                : isAuction
                ? 'Last item · auction live'
                : `${listing.quantity} available`}
            </span>
          </div>
          <span className="text-[28px] font-bold text-[#0A0E1A]">
            ₹{isAuction ? listing.currentBid : isSold ? listing.finalPrice : listing.price}
          </span>
        </div>

        {listing.description && (
          <p className="text-sm text-[#4B5563] leading-[1.5]">{listing.description}</p>
        )}

        {/* Seller info */}
        <div className="flex items-center gap-3 bg-[#F5F6F8] rounded-[14px] p-3">
          <div className="w-11 h-11 rounded-full bg-[#0062FF] flex items-center justify-center text-white font-bold">
            {listing.sellerName?.[0] || 'S'}
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-sm font-semibold text-[#0A0E1A]">{listing.sellerName}</span>
            <span className="text-[11px] font-medium text-[#9CA3AF]">Room {listing.sellerRoom}</span>
          </div>
        </div>

        {/* ── Auction panel ────────────────────────── */}
        {isAuction && (
          <div className="flex flex-col gap-4 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] rounded-[18px] p-5 border border-[#F59E0B]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#B45309]">
                <IconFlame size={18} />
                <span className="text-sm font-bold tracking-[0.5px]">AUCTION LIVE</span>
              </div>
              <span className="text-2xl font-bold text-[#0A0E1A] tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4B5563]">Current bid</span>
              <span className="text-[22px] font-bold text-[#0A0E1A]">₹{listing.currentBid}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#4B5563]">
              <span>
                Leading: <strong className="text-[#0A0E1A]">{listing.currentBidderName}</strong>
                {listing.currentBidderRoom && (
                  <span className="text-[#9CA3AF]"> · Room {listing.currentBidderRoom}</span>
                )}
                {isCurrentBidder && <span className="ml-1 text-[#0062FF] font-semibold">(you)</span>}
              </span>
            </div>

            {timeLeft > 0 && !isSeller && (
              <div className="flex gap-2 pt-1">
                <div className="flex-1 h-[46px] bg-white rounded-[12px] flex items-center px-3 border border-[#E5E7EB]">
                  <span className="text-sm text-[#9CA3AF] mr-1">₹</span>
                  <input
                    type="number"
                    min={minNextBid}
                    value={bidInput}
                    onChange={(e) => setBidInput(e.target.value)}
                    placeholder={`${minNextBid} or more`}
                    className="flex-1 bg-transparent outline-none text-sm text-[#0A0E1A]"
                  />
                </div>
                <button
                  onClick={handleBid}
                  disabled={submitting}
                  className="h-[46px] px-5 bg-[#0062FF] text-white font-semibold rounded-[12px] text-sm hover:bg-[#0055E0] disabled:opacity-60 transition"
                >
                  {submitting ? '...' : 'Bid'}
                </button>
              </div>
            )}

            {bids.length > 0 && (
              <div className="flex flex-col gap-1 pt-2 border-t border-[#F59E0B]/20">
                <span className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-[0.5px] mb-1">
                  Bid history
                </span>
                {bids.slice(0, 5).map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#4B5563] truncate">
                      <strong className="text-[#0A0E1A] font-semibold">{bid.userName}</strong>
                      {bid.userRoom && <span className="text-[#9CA3AF]"> · Room {bid.userRoom}</span>}
                    </span>
                    <span className="font-semibold text-[#0A0E1A] flex-shrink-0 ml-2">₹{bid.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Sold panel ───────────────────────────── */}
        {isSold && (
          <div className="flex flex-col gap-2 bg-[#F0FDF4] rounded-[18px] p-5 border border-[#10B981]/20">
            <div className="flex items-center gap-2 text-[#065F46]">
              <IconCheckCircle size={16} />
              <span className="text-sm font-bold tracking-[0.5px]">SOLD</span>
            </div>
            <span className="text-sm text-[#0A0E1A]">
              Won by <strong>{listing.winnerName || 'Unknown'}</strong> for <strong>₹{listing.finalPrice}</strong>
            </span>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="bg-[#FEF2F2] text-[#B91C1C] text-xs font-medium rounded-[10px] px-3 py-2">
            {errorMsg}
          </div>
        )}

        {/* ── Primary CTA ──────────────────────────── */}
        {!isAuction && !isSold && (
          <button
            onClick={handleBuy}
            disabled={submitting || isSeller}
            className="w-full h-[56px] bg-[#0062FF] text-white font-semibold rounded-[16px] text-[15px] hover:bg-[#0055E0] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Processing...'
            ) : isSeller ? (
              'Your listing'
            ) : listing.quantity === 1 ? (
              <>
                <IconFlame size={18} />
                Buy (starts 5-min auction)
              </>
            ) : (
              `Buy — ₹${listing.price}`
            )}
          </button>
        )}

        <button
          onClick={async () => {
            if (!user || !listing) return;
            if (isSeller) {
              setErrorMsg('That\'s your listing — you can\'t message yourself');
              return;
            }
            try {
              const convoId = await getOrCreateConversation(
                {
                  id: user.uid,
                  name: user.displayName || user.email || 'User',
                  photoURL: user.photoURL,
                },
                {
                  id: listing.sellerId,
                  name: listing.sellerName,
                  photoURL: null,
                },
                { id: listing.id, title: listing.title }
              );
              router.push(`/messages/${convoId}`);
            } catch (e) {
              setErrorMsg(e instanceof Error ? e.message : 'Failed to open chat');
            }
          }}
          className="w-full h-[46px] border border-[#E5E7EB] text-[#0A0E1A] font-semibold rounded-[14px] text-sm hover:bg-[#F5F6F8] transition"
        >
          Message Seller
        </button>
      </div>

      {/* ── Info Modal ───────────────────────────── */}
      {infoModal && (
        <div
          onClick={() => setInfoModal(null)}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[24px] w-full max-w-[400px] p-7 shadow-2xl flex flex-col gap-5"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  infoModal.icon === 'flame'
                    ? 'bg-[#FFF3E0] text-[#F59E0B]'
                    : 'bg-[#F0FDF4] text-[#10B981]'
                }`}
              >
                {infoModal.icon === 'flame' ? <IconFlame size={28} /> : <IconCheckCircle size={28} />}
              </div>
              <h2 className="text-[20px] font-bold text-[#0A0E1A] tracking-[-0.5px]">
                {infoModal.title}
              </h2>
              <p className="text-sm text-[#4B5563] leading-[1.5]">{infoModal.body}</p>
            </div>
            <button
              onClick={() => setInfoModal(null)}
              className="w-full h-[48px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm hover:bg-[#0055E0] active:scale-[0.98] transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
