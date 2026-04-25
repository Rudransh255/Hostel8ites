'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { subscribeToProfile, saveProfile, type UserProfile } from '@/lib/profile';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

// ── Onboarding form for first-time users ────────────
function OnboardingForm({ user, onDone }: { user: User; onDone: () => void }) {
  const [name, setName] = useState(user.displayName || '');
  const [hostelName, setHostelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hostelName.trim() || !roomNumber.trim()) {
      setError('Please fill all fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveProfile({
        uid: user.uid,
        name: name.trim(),
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
        email: user.email || '',
        photoURL: user.photoURL,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] shadow-[0_4px_32px_rgba(0,0,0,0.08)] px-8 py-10 w-full max-w-[420px] flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <span className="text-[#0062FF] text-[11px] font-semibold tracking-[1.5px]">
            ONE LAST STEP
          </span>
          <h1 className="text-[24px] font-bold text-[#0A0E1A] tracking-[-0.5px]">
            Set up your profile
          </h1>
          <p className="text-sm text-[#4B5563] leading-[1.4]">
            This helps your hostel mates find and trust you. You can edit this later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              maxLength={40}
              className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Hostel Block / Name</label>
            <input
              type="text"
              value={hostelName}
              onChange={(e) => setHostelName(e.target.value)}
              placeholder="e.g. Block A, Hostel 5"
              maxLength={40}
              className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Room Number</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 204"
              maxLength={10}
              className="w-full h-[52px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
            />
          </div>

          {error && (
            <div className="bg-[#FEF2F2] text-[#B91C1C] text-xs font-medium rounded-[10px] px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim() || !hostelName.trim() || !roomNumber.trim()}
            className="w-full h-[52px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm hover:bg-[#0055E0] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (typeof window !== 'undefined') {
        if (u) {
          localStorage.setItem('hostelmart_user_id', u.uid);
          localStorage.setItem('hostelmart_user_name', u.displayName || u.email || 'User');
        } else {
          localStorage.removeItem('hostelmart_user_id');
          localStorage.removeItem('hostelmart_user_name');
        }
      }
    });
  }, []);

  // Subscribe to profile when user is known
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileReady(false);
      return;
    }
    setProfileReady(false);
    const unsub = subscribeToProfile(user.uid, (p) => {
      setProfile(p);
      setProfileReady(true);
      if (p && typeof window !== 'undefined') {
        // Override cached name with profile-set name (in case user customised)
        localStorage.setItem('hostelmart_user_name', p.name);
      }
    });
    return () => unsub();
  }, [user]);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(e instanceof Error ? e.message : 'Sign-in failed');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-[#9CA3AF]">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-[28px] shadow-[0_4px_32px_rgba(0,0,0,0.08)] px-8 py-10 w-full max-w-[420px] flex flex-col gap-6">

          <div className="flex flex-col gap-2">
            <span className="text-[#0062FF] text-[11px] font-semibold tracking-[1.5px]">
              HOSTELMART
            </span>
            <h1 className="text-[26px] font-bold text-[#0A0E1A] tracking-[-0.5px]">
              Sign in to continue
            </h1>
            <p className="text-sm text-[#4B5563] leading-[1.4]">
              Buy and sell with your hostel neighbours. Sign in with Google to get started.
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="flex items-center justify-center gap-3 w-full h-[52px] bg-white border border-[#E5E7EB] text-[#0A0E1A] font-semibold rounded-[14px] text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {signingIn ? 'Signing in...' : 'Continue with Google'}
          </button>

          {error && (
            <div className="bg-[#FEF2F2] text-[#B91C1C] text-xs font-medium rounded-[10px] px-3 py-2">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Auth done, but profile still loading
  if (!profileReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-[#9CA3AF]">Loading profile...</span>
      </div>
    );
  }

  // Auth done but no profile yet — show onboarding
  if (!profile) {
    return <OnboardingForm user={user} onDone={() => { /* profile subscription will pick it up */ }} />;
  }

  return (
    <AuthContext.Provider value={{ user, profile, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within UserProvider');
  return ctx;
}
