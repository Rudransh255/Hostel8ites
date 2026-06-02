'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/UserProvider';
import { useToast } from '@/components/ToastProvider';
import { subscribeToMyListings, type ListingData } from '@/lib/listings';
import { saveProfile } from '@/lib/profile';

const blocks = ['C-Block', 'D-Block'];

function formatMemberSince(value?: { toDate?: () => Date }) {
  if (!value?.toDate) return 'Recently joined';
  return value.toDate().toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12l3 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M3 9h18" />
      <path d="M16 13a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10.5c0-1.1.9-2 2-2h2a2 2 0 1 1 0 4h-2a2 2 0 1 0 0 4h2c1.1 0 2-.9 2-2" />
      <path d="M12 7.5v9" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-[22px] border p-4 ${accent}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#6B7280]">{label}</span>
          <span className="text-[28px] font-bold tracking-[-0.04em] text-[#0A0E1A]">{value}</span>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/80 text-[#0A0E1A] shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProfileEditModal({
  open,
  initialName,
  initialHostelName,
  initialRoomNumber,
  email,
  photoURL,
  uid,
  onClose,
  onSaved,
}: {
  open: boolean;
  initialName: string;
  initialHostelName: string;
  initialRoomNumber: string;
  email: string;
  photoURL: string | null;
  uid: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(initialName);
  const [hostelName, setHostelName] = useState(initialHostelName);
  const [roomNumber, setRoomNumber] = useState(initialRoomNumber);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const isChanged =
    name.trim() !== initialName.trim() ||
    hostelName.trim() !== initialHostelName.trim() ||
    roomNumber.trim() !== initialRoomNumber.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !hostelName.trim() || !roomNumber.trim()) {
      setError('Please fill all fields before saving.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await saveProfile({
        uid,
        name: name.trim(),
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
        email,
        photoURL,
      });
      toast.success('Profile updated');
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#0A0E1A]/55 p-0 md:items-center md:p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        onClick={() => !saving && onClose()}
      />

      <div className="relative w-full rounded-t-[30px] bg-white px-5 pb-6 pt-5 shadow-[0_-10px_40px_rgba(10,14,26,0.18)] md:max-w-[520px] md:rounded-[30px] md:px-7 md:pb-7 md:pt-6">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D1D5DB] md:hidden" />

        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-[#F97316]">
              Edit profile
            </span>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] text-[#0A0E1A]">
              Keep your hostel card fresh
            </h2>
            <p className="text-sm leading-[1.5] text-[#6B7280]">
              Update the details your buyers and sellers see across the app.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F6F8] text-[#6B7280] transition hover:bg-[#ECEFF3] hover:text-[#0A0E1A] disabled:opacity-60"
            aria-label="Close edit profile"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-medium text-[#374151]">Display name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                className="h-[54px] rounded-[16px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-sm text-[#0A0E1A] outline-none transition focus:border-[#F97316] focus:bg-white"
                placeholder="Your full name"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#374151]">Hostel block</span>
              <select
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                className="h-[54px] rounded-[16px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-sm text-[#0A0E1A] outline-none transition focus:border-[#F97316] focus:bg-white"
              >
                <option value="" disabled>Select block</option>
                {blocks.map((block) => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#374151]">Room number</span>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                maxLength={10}
                className="h-[54px] rounded-[16px] border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-sm text-[#0A0E1A] outline-none transition focus:border-[#F97316] focus:bg-white"
                placeholder="204"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-[16px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#B91C1C]">
              {error}
            </div>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-[52px] flex-1 rounded-[16px] bg-[#F5F6F8] text-sm font-semibold text-[#0A0E1A] transition hover:bg-[#ECEFF3] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !isChanged}
              className="h-[52px] flex-1 rounded-[16px] bg-[#F97316] text-sm font-semibold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const [myListings, setMyListings] = useState<ListingData[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMyListings(user.uid, setMyListings);
    return () => unsub();
  }, [user]);

  const displayName = profile?.name || user?.displayName || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';
  const email = user?.email || '';

  const stats = useMemo(() => {
    const activeCount = myListings.filter((item) => item.status === 'active' || item.status === 'auction').length;
    const soldCount = myListings.filter((item) => item.status === 'sold').length;
    const revenue = myListings
      .filter((item) => item.status === 'sold')
      .reduce((sum, item) => sum + (item.finalPrice ?? item.currentBid ?? item.price), 0);

    return {
      activeCount,
      soldCount,
      revenue,
    };
  }, [myListings]);

  return (
    <>
      <div className="min-h-screen bg-[linear-gradient(180deg,#FFF7ED_0%,#FFFFFF_32%,#FFFFFF_100%)] px-5 pb-8 pt-5 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
          <div className="rounded-[30px] border border-[#FED7AA] bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_36%),linear-gradient(135deg,#111827_0%,#1F2937_55%,#374151_100%)] p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-start gap-4 md:gap-5">
                {user?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 rounded-[24px] border border-white/20 object-cover shadow-[0_12px_28px_rgba(0,0,0,0.22)] md:h-24 md:w-24"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#F97316] text-[32px] font-bold shadow-[0_12px_28px_rgba(0,0,0,0.22)] md:h-24 md:w-24 md:text-[36px]">
                    {initial}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <span className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[1.3px] text-[#FDBA74]">
                    Resident profile
                  </span>
                  <div>
                    <h1 className="text-[28px] font-bold tracking-[-0.05em] md:text-[36px]">
                      {displayName}
                    </h1>
                    <p className="mt-1 text-sm text-white/72 md:text-[15px]">
                      {profile ? `Room ${profile.roomNumber} • ${profile.hostelName}` : 'HostelMart member'}
                    </p>
                    {email && (
                      <p className="mt-1 break-all text-xs text-white/55 md:text-sm">{email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
                <div className="rounded-[20px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/55">Member since</p>
                  <p className="mt-2 text-lg font-semibold">{formatMemberSince(profile?.createdAt)}</p>
                </div>
                <div className="rounded-[20px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/55">Live listings</p>
                  <p className="mt-2 text-lg font-semibold">{stats.activeCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Active listings"
              value={String(stats.activeCount)}
              accent="border-[#BFDBFE] bg-[#EFF6FF]"
              icon={<BagIcon />}
            />
            <StatCard
              label="Completed sales"
              value={String(stats.soldCount)}
              accent="border-[#FDE68A] bg-[#FFFBEB]"
              icon={<CoinIcon />}
            />
            <StatCard
              label="Seller rating"
              value="Soon"
              accent="border-[#FBCFE8] bg-[#FDF2F8]"
              icon={<StarIcon />}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#F97316]">Profile details</span>
                  <h2 className="mt-1 text-[22px] font-bold tracking-[-0.04em] text-[#0A0E1A]">Your hostel identity</h2>
                </div>
                <button
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] px-4 py-2 text-sm font-semibold text-[#C2410C] transition hover:bg-[#FFEDD5]"
                >
                  <EditIcon />
                  Edit profile
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] bg-[#F8FAFC] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.1px] text-[#94A3B8]">Full name</p>
                  <p className="mt-2 text-base font-semibold text-[#0A0E1A]">{displayName}</p>
                </div>
                <div className="rounded-[20px] bg-[#F8FAFC] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.1px] text-[#94A3B8]">Email</p>
                  <p className="mt-2 break-all text-base font-semibold text-[#0A0E1A]">{email || 'Not available'}</p>
                </div>
                <div className="rounded-[20px] bg-[#F8FAFC] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.1px] text-[#94A3B8]">Hostel block</p>
                  <p className="mt-2 text-base font-semibold text-[#0A0E1A]">{profile?.hostelName || 'Not set'}</p>
                </div>
                <div className="rounded-[20px] bg-[#F8FAFC] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[1.1px] text-[#94A3B8]">Room number</p>
                  <p className="mt-2 text-base font-semibold text-[#0A0E1A]">{profile?.roomNumber || 'Not set'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
              <span className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#F97316]">Quick actions</span>
              <h2 className="mt-1 text-[22px] font-bold tracking-[-0.04em] text-[#0A0E1A]">Manage your account</h2>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-4 transition hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0A0E1A]">My listings</p>
                    <p className="mt-1 text-xs text-[#6B7280]">Track the items you have posted and sold.</p>
                  </div>
                  <div className="text-[#9CA3AF]">
                    <ArrowRightIcon />
                  </div>
                </Link>

                <button
                  onClick={() => setEditOpen(true)}
                  className="flex w-full items-center justify-between rounded-[20px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-4 text-left transition hover:bg-[#FEF3C7]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0A0E1A]">Edit profile</p>
                    <p className="mt-1 text-xs text-[#6B7280]">Change your name, hostel block, or room number.</p>
                  </div>
                  <div className="text-[#D97706]">
                    <ArrowRightIcon />
                  </div>
                </button>

                <button
                  onClick={signOut}
                  className="flex w-full items-center justify-between rounded-[20px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-left transition hover:bg-[#FEE2E2]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#B91C1C]">Logout</p>
                    <p className="mt-1 text-xs text-[#7F1D1D]">Sign out from this device.</p>
                  </div>
                  <div className="text-[#DC2626]">
                    <ArrowRightIcon />
                  </div>
                </button>
              </div>

              <div className="mt-5 rounded-[22px] bg-[linear-gradient(135deg,#FFF7ED_0%,#FFFBEB_100%)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#C2410C]">Profile note</p>
                <p className="mt-2 text-sm leading-[1.6] text-[#7C2D12]">
                  Your updated room and block appear on listings and requests, which helps hostel mates know exactly where to find you.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {user && (
        <ProfileEditModal
          key={`${profile?.name || user.displayName || ''}-${profile?.hostelName || ''}-${profile?.roomNumber || ''}`}
          open={editOpen}
          initialName={profile?.name || user.displayName || ''}
          initialHostelName={profile?.hostelName || ''}
          initialRoomNumber={profile?.roomNumber || ''}
          email={user.email || ''}
          photoURL={user.photoURL}
          uid={user.uid}
          onClose={() => setEditOpen(false)}
          onSaved={() => {}}
        />
      )}
    </>
  );
}
