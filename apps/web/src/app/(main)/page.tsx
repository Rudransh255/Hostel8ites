'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { subscribeToListings, type ListingData } from '@/lib/listings';

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

const categories = [
  { name: 'All', active: true },
  { name: 'Snacks', active: false },
  { name: 'Noodles', active: false },
  { name: 'Drinks', active: false },
  { name: 'Toiletries', active: false },
  { name: 'Stationery', active: false },
];

function formatTime(ms: number) {
  if (ms <= 0) return '0:00';
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HomePage() {
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

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

  return (
    <div className="flex flex-col gap-5 px-5 pt-4 md:px-8 md:pt-6">

      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-[#9CA3AF]">Hey, Rudransh</span>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Marketplace</h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-[#0062FF]" />
      </div>

      {/* ── Search Row ──────────────────────────── */}
      <div className="flex gap-[10px] items-center">
        <div className="flex-1 h-[52px] bg-[#F5F6F8] rounded-[14px] flex items-center gap-[10px] px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <span className="text-sm text-[#9CA3AF]">Search snacks, noodles, drinks...</span>
        </div>
        <Link href="/dashboard/add-listing" className="w-[52px] h-[52px] bg-[#0062FF] rounded-[14px] flex items-center justify-center flex-shrink-0 hover:bg-[#0055E0] transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
        </Link>
      </div>

      {/* ── Category Chips ──────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`px-4 py-[10px] rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
              cat.active
                ? 'bg-[#0A0E1A] text-white font-semibold'
                : 'bg-[#F5F6F8] text-[#4B5563] hover:bg-[#E8EAED]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Sort Row ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#4B5563]">
          {listings.length} item{listings.length === 1 ? '' : 's'} available
        </span>
        <div className="flex items-center gap-[6px] bg-[#E6EFFF] rounded-full px-3 py-2 cursor-pointer hover:bg-[#D6E4FF] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0062FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h4"/><path d="M11 8h7"/><path d="M11 12h10"/>
          </svg>
          <span className="text-xs font-semibold text-[#0062FF]">Newest</span>
        </div>
      </div>

      {/* ── Product Grid ────────────────────────── */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#9CA3AF]">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#9CA3AF] mb-2">
            <IconPackage size={32} />
          </div>
          <p className="text-sm font-medium text-[#9CA3AF]">No listings yet</p>
          <Link href="/dashboard/add-listing" className="text-[#0062FF] font-semibold text-sm mt-2">
            Be the first to list something
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
          {listings.map((product) => {
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
    </div>
  );
}
