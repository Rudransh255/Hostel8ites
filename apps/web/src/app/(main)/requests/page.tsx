'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/UserProvider';
import { useToast } from '@/components/ToastProvider';
import { isModerator } from '@/lib/moderators';
import {
  subscribeToRequests,
  createRequest,
  deleteRequest,
  resolveRequest,
  type RequestData,
  type Urgency,
} from '@/lib/requests';
import { getOrCreateConversation } from '@/lib/messages';

const urgencyConfig: Record<Urgency, { label: string; color: string; bg: string }> = {
  high: { label: 'URGENT', color: '#EF4444', bg: '#FEF2F2' },
  medium: { label: 'MEDIUM', color: '#F59E0B', bg: '#FFFBEB' },
  low: { label: 'LOW', color: '#10B981', bg: '#F0FDF4' },
};

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function RequestsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const userIsMod = isModerator(user?.email);

  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<RequestData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [item, setItem] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('medium');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToRequests((items) => {
      setRequests(items);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (!user || !profile) return null;

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;
    setPosting(true);
    try {
      await createRequest({
        item: item.trim(),
        budget: budget ? Number(budget) : null,
        urgency,
        description: description.trim(),
        requesterId: user.uid,
        requesterName: profile.name,
        requesterRoom: profile.roomNumber,
        requesterHostel: profile.hostelName,
        requesterPhoto: user.photoURL,
      });
      toast.success('Request posted!');
      setItem('');
      setBudget('');
      setUrgency('medium');
      setDescription('');
      setShowForm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleIHaveThis = async (req: RequestData) => {
    if (req.requesterId === user.uid) return;
    try {
      const convoId = await getOrCreateConversation(
        {
          id: user.uid,
          name: profile.name,
          photoURL: user.photoURL,
        },
        {
          id: req.requesterId,
          name: req.requesterName,
          photoURL: req.requesterPhoto,
        }
      );
      router.push(`/messages/${convoId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start chat');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const isOwner = confirmDelete.requesterId === user.uid;
      if (!isOwner && !userIsMod) {
        toast.error('Not authorized');
        return;
      }
      await deleteRequest(confirmDelete.id, { uid: user.uid, isModerator: userIsMod });
      toast.success('Request removed');
      setConfirmDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleResolve = async (req: RequestData) => {
    try {
      await resolveRequest(req.id);
      toast.success('Marked as resolved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pt-4 md:px-8 md:pt-6">
      <div className="flex flex-col gap-[6px]">
        <span className="text-[#0062FF] text-[11px] font-semibold tracking-[1px]">COMMUNITY</span>
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Request Board</h1>
        <p className="text-sm text-[#4B5563] leading-[1.4]">
          Post a request and someone in your hostel will respond.
        </p>
      </div>

      <button
        onClick={() => setShowForm((v) => !v)}
        className="w-full h-[52px] bg-[#0062FF] text-white font-semibold rounded-[14px] text-sm hover:bg-[#0055E0] transition flex items-center justify-center gap-2"
      >
        {showForm ? 'Cancel' : '+ Post a Request'}
      </button>

      {showForm && (
        <form
          onSubmit={handlePost}
          className="flex flex-col gap-4 bg-[#F5F6F8] rounded-[18px] p-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">What do you need?</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
              maxLength={60}
              placeholder="e.g. Phone charger (Type-C)"
              className="w-full h-[48px] bg-white rounded-[12px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-[#4B5563]">Budget (₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                placeholder="optional"
                className="w-full h-[48px] bg-white rounded-[12px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-[#4B5563]">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Urgency)}
                className="w-full h-[48px] bg-white rounded-[12px] px-4 text-sm text-[#0A0E1A] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition cursor-pointer"
              >
                <option value="high">Urgent</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#4B5563]">Notes (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              placeholder="Any extra details..."
              className="w-full h-[80px] bg-white rounded-[12px] p-3 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={posting || !item.trim()}
            className="w-full h-[48px] bg-[#0062FF] text-white font-semibold rounded-[12px] text-sm hover:bg-[#0055E0] transition disabled:opacity-60"
          >
            {posting ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-[#0A0E1A]">
          Open requests {requests.length > 0 && `(${requests.length})`}
        </span>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#9CA3AF]">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-[#9CA3AF]">No open requests</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Be the first to post one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map((req) => {
              const urg = urgencyConfig[req.urgency];
              const isMine = req.requesterId === user.uid;
              const canDelete = isMine || userIsMod;
              const ms = req.createdAt?.toMillis?.() ?? Date.now();

              return (
                <div
                  key={req.id}
                  className="bg-[#F5F6F8] rounded-[18px] p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="text-[15px] font-semibold text-[#0A0E1A] truncate">{req.item}</span>
                      <span className="text-xs text-[#9CA3AF] truncate">
                        {req.requesterName} · Room {req.requesterRoom} · {timeAgo(ms)} ago
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-bold tracking-[0.5px] rounded-full px-[10px] py-[4px] flex-shrink-0"
                      style={{ color: urg.color, backgroundColor: urg.bg }}
                    >
                      {urg.label}
                    </span>
                  </div>

                  {req.description && (
                    <p className="text-xs text-[#4B5563] leading-[1.4] line-clamp-3">{req.description}</p>
                  )}

                  {req.budget !== null && (
                    <span className="text-xs text-[#4B5563]">
                      Budget: <strong>₹{req.budget}</strong>
                    </span>
                  )}

                  <div className="flex gap-2">
                    {isMine ? (
                      <button
                        onClick={() => handleResolve(req)}
                        className="flex-1 h-10 bg-[#10B981] text-white font-semibold rounded-[12px] text-[13px] hover:bg-[#059669] transition-colors"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleIHaveThis(req)}
                        className="flex-1 h-10 border border-[#0062FF] text-[#0062FF] font-semibold rounded-[12px] text-[13px] hover:bg-[#E6EFFF] transition-colors"
                      >
                        I Have This
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => setConfirmDelete(req)}
                        aria-label="Delete request"
                        className="w-10 h-10 bg-white text-[#9CA3AF] hover:text-[#B91C1C] hover:bg-[#FEF2F2] rounded-[12px] flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
              <h2 className="text-[18px] font-bold text-[#0A0E1A]">Delete request?</h2>
              <p className="text-sm text-[#4B5563]">
                &ldquo;{confirmDelete.item}&rdquo; will be permanently removed.
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
