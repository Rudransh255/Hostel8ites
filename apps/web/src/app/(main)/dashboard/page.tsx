'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/UserProvider';
import { useToast } from '@/components/ToastProvider';
import { subscribeToMyListings, deleteListing, type ListingData } from '@/lib/listings';

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

type Tab = 'active' | 'sold';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');
  const [confirmDelete, setConfirmDelete] = useState<ListingData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete || !user) return;
    setDeleting(true);
    try {
      await deleteListing(confirmDelete.id, user.uid);
      toast.success('Listing deleted');
      setConfirmDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMyListings(user.uid, (items) => {
      setListings(items);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (!user) return null;

  const activeListings = listings.filter((l) => l.status === 'active' || l.status === 'auction');
  const soldListings = listings.filter((l) => l.status === 'sold');
  const totalViews = listings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);

  const visible = tab === 'active' ? activeListings : soldListings;

  return (
    <div className="flex flex-col gap-5 px-5 pt-4 md:px-8 md:pt-6">

      <div className="flex flex-col gap-[6px]">
        <span className="text-[#0062FF] text-[11px] font-semibold tracking-[1px]">MY LISTINGS</span>
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[#F5F6F8] rounded-[14px] p-4 text-center">
          <span className="text-2xl font-bold text-[#0A0E1A]">{activeListings.length}</span>
          <p className="text-xs text-[#9CA3AF] mt-1">Active</p>
        </div>
        <div className="flex-1 bg-[#F5F6F8] rounded-[14px] p-4 text-center">
          <span className="text-2xl font-bold text-[#0A0E1A]">{soldListings.length}</span>
          <p className="text-xs text-[#9CA3AF] mt-1">Sold</p>
        </div>
        <div className="flex-1 bg-[#F5F6F8] rounded-[14px] p-4 text-center">
          <span className="text-2xl font-bold text-[#0A0E1A]">{totalViews}</span>
          <p className="text-xs text-[#9CA3AF] mt-1">Views</p>
        </div>
      </div>

      <Link
        href="/dashboard/add-listing"
        className="w-full h-[52px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm hover:bg-[#0055E0] transition flex items-center justify-center"
      >
        + Add New Listing
      </Link>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-[10px] rounded-full text-[13px] transition-all ${
            tab === 'active'
              ? 'bg-[#0A0E1A] text-white font-semibold'
              : 'bg-[#F5F6F8] text-[#4B5563] font-medium hover:bg-[#EEF0F3]'
          }`}
        >
          Active ({activeListings.length})
        </button>
        <button
          onClick={() => setTab('sold')}
          className={`px-4 py-[10px] rounded-full text-[13px] transition-all ${
            tab === 'sold'
              ? 'bg-[#0A0E1A] text-white font-semibold'
              : 'bg-[#F5F6F8] text-[#4B5563] font-medium hover:bg-[#EEF0F3]'
          }`}
        >
          Sold ({soldListings.length})
        </button>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#9CA3AF]">Loading your listings...</div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#9CA3AF] mb-4">
            <IconPackage size={32} />
          </div>
          <p className="text-sm font-medium text-[#9CA3AF]">
            {tab === 'active' ? 'No active listings' : 'No sold items yet'}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {tab === 'active' ? 'Tap “+ Add New Listing” above to get started.' : 'Items you sell will show up here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
          {visible.map((p) => {
            const isAuction = p.status === 'auction';
            const isSold = p.status === 'sold';
            const canDelete = !isAuction && !isSold;
            const img = p.images?.[0];
            const displayPrice = isSold ? p.finalPrice : isAuction ? p.currentBid ?? p.price : p.price;

            return (
              <Link
                key={p.id}
                href={`/listing/${p.id}`}
                className="flex items-center gap-[14px] bg-[#F5F6F8] rounded-[18px] p-[14px] hover:bg-[#EEF0F3] hover:shadow-md transition-all duration-200 relative"
              >
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDelete(p);
                    }}
                    aria-label="Delete listing"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-[#FEF2F2] hover:text-[#B91C1C] text-[#9CA3AF] flex items-center justify-center shadow-sm transition-colors z-10"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                )}
                {isAuction && (
                  <span className="absolute top-2 right-2 bg-[#F59E0B] text-white text-[9px] font-bold tracking-[0.5px] rounded-full px-[8px] py-[4px] flex items-center gap-[4px]">
                    <IconFlame size={10} />
                    LIVE
                  </span>
                )}
                {isSold && (
                  <span className="absolute top-2 right-2 bg-[#10B981] text-white text-[9px] font-bold tracking-[0.5px] rounded-full px-[8px] py-[4px]">
                    SOLD
                  </span>
                )}

                <div className="w-[72px] h-[72px] bg-white rounded-[14px] flex items-center justify-center flex-shrink-0 overflow-hidden text-[#9CA3AF]">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <IconPackage size={32} />
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className="text-[15px] font-semibold text-[#0A0E1A] truncate">{p.title}</span>
                  <span className="text-xs font-medium text-[#9CA3AF]">{p.category}</span>
                  <span className="text-[11px] font-medium text-[#4B5563]">
                    {isSold ? `Sold to ${p.winnerName || '—'}` : isAuction ? 'Auction live' : `${p.quantity} left`}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-[2px] flex-shrink-0">
                  <span className="text-[10px] font-medium text-[#9CA3AF]">
                    {isSold ? 'sold for' : isAuction ? 'bid' : 'price'}
                  </span>
                  <span
                    className={`text-white text-[15px] font-bold rounded-full px-3 py-[6px] ${
                      isSold ? 'bg-[#10B981]' : isAuction ? 'bg-[#F59E0B]' : 'bg-[#0062FF]'
                    }`}
                  >
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
                &ldquo;{confirmDelete.title}&rdquo; will be permanently removed. This can&apos;t be undone.
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
