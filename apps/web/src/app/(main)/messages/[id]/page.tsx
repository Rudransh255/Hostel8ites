'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/UserProvider';
import {
  subscribeToConversation,
  subscribeToMessages,
  sendMessage,
  type Conversation,
  type Message,
} from '@/lib/messages';

function formatMessageTime(ms: number) {
  if (!ms) return '';
  const d = new Date(ms);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return time;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${time}`;
}

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();

  const [convo, setConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToConversation(id, (c) => {
      if (!c) setNotFound(true);
      else setConvo(c);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToMessages(id, setMessages);
    return () => unsub();
  }, [id]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  if (!user) return null;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 gap-4">
        <h1 className="text-xl font-bold text-[#0A0E1A]">Conversation not found</h1>
        <button onClick={() => router.push('/messages')} className="text-[#0062FF] font-semibold text-sm">
          Back to Messages
        </button>
      </div>
    );
  }

  if (!convo) {
    return <div className="py-20 text-center text-sm text-[#9CA3AF]">Loading...</div>;
  }

  const otherId = convo.participants.find((p) => p !== user.uid) || '';
  const otherName = convo.participantNames?.[otherId] || 'Unknown';
  const otherPhoto = convo.participantPhotos?.[otherId];
  const initial = otherName[0]?.toUpperCase() || '?';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    try {
      await sendMessage(id!, {
        id: user.uid,
        name: user.displayName || user.email || 'User',
        photoURL: user.photoURL,
      }, trimmed);
    } catch (err) {
      console.error(err);
      setText(trimmed); // restore on failure
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-100px)] md:h-[calc(100vh-100px)]">

      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#E5E7EB] md:px-8 bg-white sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-[#F5F6F8] rounded-full flex items-center justify-center hover:bg-[#EEF0F3] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        {otherPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={otherPhoto}
            alt={otherName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#0062FF] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <span className="text-sm font-semibold text-[#0A0E1A] truncate">{otherName}</span>
          {convo.listingTitle && (
            <span className="text-[11px] text-[#9CA3AF] truncate">About: {convo.listingTitle}</span>
          )}
        </div>
      </div>

      {/* ── Messages ────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 md:px-8 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center max-w-[260px] text-[#9CA3AF]">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Send the first message to start the conversation.</p>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex flex-col gap-2">
          {messages.map((m, idx) => {
            const mine = m.senderId === user.uid;
            const ms = m.createdAt?.toMillis?.() ?? 0;
            const prev = messages[idx - 1];
            const prevMs = prev?.createdAt?.toMillis?.() ?? 0;
            const showTime = !prev || ms - prevMs > 5 * 60 * 1000; // 5min gap

            return (
              <div key={m.id} className="flex flex-col gap-1">
                {showTime && ms > 0 && (
                  <span className="text-[10px] text-[#9CA3AF] text-center my-2">
                    {formatMessageTime(ms)}
                  </span>
                )}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-[18px] px-4 py-[10px] text-sm leading-[1.4] break-words ${
                      mine
                        ? 'bg-[#0062FF] text-white rounded-br-[6px]'
                        : 'bg-[#F5F6F8] text-[#0A0E1A] rounded-bl-[6px]'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* ── Input ───────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 px-5 py-3 border-t border-[#E5E7EB] bg-white md:px-8"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-[44px] bg-[#F5F6F8] rounded-[14px] px-4 text-sm text-[#0A0E1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#0062FF]/20 transition"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-[44px] h-[44px] bg-[#0062FF] rounded-[14px] flex items-center justify-center hover:bg-[#0055E0] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z"/>
            <path d="M22 2 11 13"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
