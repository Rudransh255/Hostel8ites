'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/UserProvider';
import { subscribeToConversations, type Conversation } from '@/lib/messages';

function formatTimeAgo(ms: number) {
  if (!ms) return '';
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  return `${w}w`;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, (cs) => {
      setConvos(cs);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (!user) return null;

  const unreadCount = convos.filter(
    (c) => c.lastSenderId && c.lastSenderId !== user.uid
  ).length;

  return (
    <div className="flex flex-col gap-5 px-5 pt-4 md:px-8 md:pt-6">

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          {unreadCount > 0 && (
            <span className="text-[#0062FF] text-[11px] font-semibold tracking-[1px]">
              {unreadCount} ACTIVE CONVERSATION{unreadCount === 1 ? '' : 'S'}
            </span>
          )}
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0A0E1A] tracking-[-0.5px]">Messages</h1>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-[#9CA3AF]">Loading conversations...</div>
      ) : convos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#9CA3AF]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-[#0A0E1A]">No messages yet</p>
          <p className="text-xs text-[#9CA3AF] max-w-[260px]">
            Tap &ldquo;Message Seller&rdquo; on any listing to start a conversation.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {convos.map((c) => {
            const otherId = c.participants.find((p) => p !== user.uid) || '';
            const otherName = c.participantNames?.[otherId] || 'Unknown';
            const otherPhoto = c.participantPhotos?.[otherId];
            const initial = otherName[0]?.toUpperCase() || '?';
            const lastMs = c.lastMessageAt?.toMillis?.() ?? 0;
            const isUnread = c.lastSenderId && c.lastSenderId !== user.uid;
            const youSent = c.lastSenderId === user.uid;

            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 bg-[#F5F6F8] rounded-[16px] p-3 hover:bg-[#EEF0F3] transition-colors"
              >
                {otherPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={otherPhoto}
                    alt={otherName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#0062FF] flex items-center justify-center text-white font-bold text-[17px] flex-shrink-0">
                    {initial}
                  </div>
                )}

                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm ${isUnread ? 'font-bold' : 'font-semibold'} text-[#0A0E1A] truncate`}>
                      {otherName}
                    </span>
                    <span className={`text-[11px] flex-shrink-0 ${isUnread ? 'text-[#0062FF] font-semibold' : 'text-[#9CA3AF]'}`}>
                      {formatTimeAgo(lastMs)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs truncate ${isUnread ? 'text-[#0A0E1A] font-medium' : 'text-[#4B5563]'}`}>
                      {youSent && 'You: '}
                      {c.lastMessage || 'Start a conversation'}
                    </span>
                    {isUnread && (
                      <span className="w-2 h-2 bg-[#0062FF] rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
