'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/UserProvider';
import { useToast } from '@/components/ToastProvider';
import { subscribeToListings, deleteListing, type ListingData } from '@/lib/listings';
import { isModerator } from '@/lib/moderators';

const IconPackage = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.55 4.24"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" x2="12" y1="22" y2="12"/>
  </svg>
);

const IconFlame = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const CATEGORIES = ['All', 'Snacks', 'Noodles', 'Drinks', 'Toiletries', 'Stationery', 'Other'];

type SortKey = 'newest' | 'price-asc' | 'price-desc';

const SORT_LABELS: Record<SortKey, string> = {
  'newest': 'Newest',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
};

function formatTime(ms: number) {
  if (ms <= 0) return '0:00';
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HomePage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Filters
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [sortOpen, setSortOpen] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<ListingData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const userIsMod = isModerator(user?.email);

  const handleDelete = async () => {
    if (!confirmDelete || !user) return;
    setDeleting(true);
    try {
      await deleteListing(confirmDelete.id, {
        uid: user.uid,
        email: user.email,
        isModerator: userIsMod,
      });
      toast.success('Listing deleted');
      setConfirmDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const unsub = subscribeToListings((items) => {
      setListings(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Apply filters + sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = listings.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (q) {
        const inTitle = item.title?.toLowerCase().includes(q);
        const inDescription = item.description?.toLowerCase().includes(q);
        const inSeller = item.sellerName?.toLowerCase().includes(q);
        if (!inTitle && !inDescription && !inSeller) return false;
      }
      return true;
    });

    // Sort
    items = [...items].sort((a, b) => {
      const aPrice = a.status === 'auction' ? a.currentBid ?? a.price : a.price;
      const bPrice = b.status === 'auction' ? b.currentBid ?? b.price : b.price;
      if (sortBy === 'price-asc') return aPrice - bPrice;
      if (sortBy === 'price-desc') return bPrice - aPrice;
      // newest is the default order (subscribeToListings already sorts by createdAt desc)
      return 0;
    });

    return items;
  }, [listings, search, activeCategory, sortBy]);

  const greetingName = profile?.name?.split(' ')[0] || 'there';
  const hasFilters = search || activeCategory !== 'All';

  return (
    <div className="flex flex-col gap-5 px-5 pt-4 md:px-8 md:pt-6">

      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-[#9CA3AF]">Hey, {greetingName}</span>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Marketplace</h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-[#0062FF] flex items-center justify-center text-white font-bold">
          {profile?.name?.[0]?.toUpperCase() || '?'}
        </div>
      </div>

      {/* ── Search Row ──────────────────────────── */}
      <div className="flex gap-[10px] items-center">
        <div className="flex-1 h-[52px] bg-[#F5F6F8] rounded-[14px] flex items-center gap-[10px] px-4 focus-within:ring-2 focus-within:ring-[#0062FF]/20 transition">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snacks, noodles, drinks..."
            className="flex-1 bg-transparent outline-none text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] min-w-0"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[#9CA3AF] hover:text-[#0A0E1A] flex-shrink-0"
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
            </button>
          )}
        </div>
        <Link
          href="/dashboard/add-listing"
          className="w-[52px] h-[52px] bg-[#0062FF] rounded-[14px] flex items-center justify-center flex-shrink-0 hover:bg-[#0055E0] transition-colors"
          aria-label="Add new listing"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
        </Link>
      </div>

      {/* ── Category Chips ──────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-[10px] rounded-full text-[13px] whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0A0E1A] text-white font-semibold'
                  : 'bg-[#F5F6F8] text-[#4B5563] font-medium hover:bg-[#E8EAED]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Sort Row ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#4B5563]">
          {filtered.length} item{filtered.length === 1 ? '' : 's'} {hasFilters ? 'matched' : 'available'}
        </span>

        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-[6px] bg-[#E6EFFF] rounded-full px-3 py-2 cursor-pointer hover:bg-[#D6E4FF] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0062FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/>
            </svg>
            <span className="text-xs font-semibold text-[#0062FF]">{SORT_LABELS[sortBy]}</span>
          </button>

          {sortOpen && (
            <>
              <div
                onClick={() => setSortOpen(false)}
                className="fixed inset-0 z-10"
              />
              <div className="absolute right-0 top-full mt-2 bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#E5E7EB] overflow-hidden z-20 min-w-[180px]">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-[#F5F6F8] transition-colors ${
                      sortBy === key ? 'text-[#0062FF] bg-[#E6EFFF]' : 'text-[#0A0E1A]'
                    }`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Product Grid ────────────────────────── */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#9CA3AF]">Loading listings...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#9CA3AF] mb-2">
            <IconPackage size={32} />
          </div>
          {hasFilters ? (
            <>
              <p className="text-sm font-medium text-[#0A0E1A]">No matches found</p>
              <p className="text-xs text-[#9CA3AF]">Try a different search term or category.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategory('All');
                }}
                className="text-[#0062FF] font-semibold text-sm mt-2"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-[#9CA3AF]">No listings yet</p>
              <Link href="/dashboard/add-listing" className="text-[#0062FF] font-semibold text-sm mt-2">
                Be the first to list something
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
          {filtered.map((product) => {
            const isAuction = product.status === 'auction';
            const endsAtMs = product.auctionEndsAt?.toMillis() ?? 0;
            const timeLeft = Math.max(0, endsAtMs - now);
            const displayPrice = isAuction ? product.currentBid ?? product.price : product.price;
            const img = product.images?.[0];

            return (
              <Link
                key={product.id}
                href={`/listing/${product.id}`}
                className="flex items-center gap-[14px] bg-[#F5F6F8] rounded-[18px] p-[14px] hover:bg-[#EEF0F3] hover:shadow-md transition-all duration-200 group relative"
              >
                {isAuction && (
                  <span className="absolute top-2 right-2 bg-[#F59E0B] text-white text-[9px] font-bold tracking-[0.5px] rounded-full px-[8px] py-[4px] flex items-center gap-[4px]">
                    <IconFlame size={10} />
                    {formatTime(timeLeft)}
                  </span>
                )}

                {userIsMod && !isAuction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDelete(product);
                    }}
                    aria-label="Delete listing (moderator)"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-[#FEF2F2] hover:text-[#B91C1C] text-[#9CA3AF] flex items-center justify-center shadow-sm transition-colors z-10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                )}

                <div className="w-[72px] h-[72px] bg-white rounded-[14px] flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:shadow-sm transition-shadow text-[#9CA3AF]">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <IconPackage size={32} />
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className="text-[15px] font-semibold text-[#0A0E1A] truncate">{product.title}</span>
                  <span className="text-xs font-medium text-[#9CA3AF]">
                    By {product.sellerName} · Room {product.sellerRoom}
                  </span>
                  <span className="text-[11px] font-medium text-[#4B5563]">
                    {isAuction ? 'Auction live' : `${product.quantity} left`}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
                  <span className="text-[10px] font-medium text-[#9CA3AF]">
                    {isAuction ? 'bid' : 'price'}
                  </span>
                  <span className={`text-white text-[15px] font-bold rounded-full px-3 py-[6px] ${isAuction ? 'bg-[#F59E0B]' : 'bg-[#0062FF]'}`}>
                    ₹{displayPrice}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <div
          onClick={() => !deleting && setConfirmDelete(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] p-6 w-full max-w-[360px] flex flex-col gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <div className="text-center flex flex-col gap-1">
              <h2 className="text-[18px] font-bold text-[#0A0E1A]">Delete listing?</h2>
              <p className="text-sm text-[#4B5563]">
                &ldquo;{confirmDelete.title}&rdquo; by {confirmDelete.sellerName} will be permanently removed.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 h-[44px] bg-[#F5F6F8] text-[#0A0E1A] font-semibold rounded-[12px] text-sm hover:bg-[#EEF0F3] transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-[44px] bg-[#DC2626] text-white font-semibold rounded-[12px] text-sm hover:bg-[#B91C1C] transition disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
