'use client';

import { useAuth } from '@/components/UserProvider';

const chevron = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.name || user?.displayName || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';
  const email = user?.email || '';

  return (
    <div className="px-5 pt-4 pb-8 md:px-8 md:pt-8">

      <div className="flex flex-col md:flex-row md:gap-8 md:items-start gap-6">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-5 md:w-[300px] md:shrink-0">

          <div className="flex flex-col items-center gap-4 pt-4 md:bg-[#F5F6F8] md:rounded-[20px] md:p-6 md:pt-6">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0062FF] flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                {initial}
              </div>
            )}
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-xl md:text-2xl font-bold text-[#0A0E1A]">{displayName}</h1>
              {profile && (
                <span className="text-sm text-[#4B5563]">
                  Room {profile.roomNumber} · {profile.hostelName}
                </span>
              )}
              {email && <span className="text-xs text-[#9CA3AF] break-all">{email}</span>}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-[#F5F6F8] rounded-[14px] p-4 text-center">
              <span className="text-2xl font-bold text-[#0A0E1A]">0</span>
              <p className="text-xs text-[#9CA3AF] mt-1">Listings</p>
            </div>
            <div className="flex-1 bg-[#F5F6F8] rounded-[14px] p-4 text-center">
              <span className="text-2xl font-bold text-[#0A0E1A]">0</span>
              <p className="text-xs text-[#9CA3AF] mt-1">Sales</p>
            </div>
            <div className="flex-1 bg-[#F5F6F8] rounded-[14px] p-4 text-center">
              <span className="text-2xl font-bold text-[#0A0E1A]">—</span>
              <p className="text-xs text-[#9CA3AF] mt-1">Rating</p>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-3 flex-1">

          <span className="hidden md:block text-xs font-semibold text-[#9CA3AF] tracking-[1px] uppercase mb-1">
            Account
          </span>

          <a
            href="/dashboard"
            className="flex items-center justify-between bg-[#F5F6F8] rounded-[14px] p-4 hover:bg-[#EEF0F3] transition-colors"
          >
            <span className="text-sm font-medium text-[#0A0E1A]">My Listings</span>
            {chevron}
          </a>

          <button className="flex items-center justify-between bg-[#F5F6F8] rounded-[14px] p-4 w-full hover:bg-[#EEF0F3] transition-colors">
            <span className="text-sm font-medium text-[#0A0E1A]">Edit Profile</span>
            {chevron}
          </button>

          <button
            onClick={signOut}
            className="flex items-center justify-between bg-[#F5F6F8] rounded-[14px] p-4 w-full hover:bg-[#FEF2F2] transition-colors mt-2"
          >
            <span className="text-sm font-medium text-[#EF4444]">Logout</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
