'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

// ── Icons ────────────────────────────────────────────
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

const styles: Record<ToastType, { bg: string; text: string; iconBg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-white border-[#10B981]/30',
    text: 'text-[#0A0E1A]',
    iconBg: 'bg-[#10B981] text-white',
    icon: <IconCheck />,
  },
  error: {
    bg: 'bg-white border-[#EF4444]/30',
    text: 'text-[#0A0E1A]',
    iconBg: 'bg-[#EF4444] text-white',
    icon: <IconAlert />,
  },
  info: {
    bg: 'bg-white border-[#0062FF]/30',
    text: 'text-[#0A0E1A]',
    iconBg: 'bg-[#0062FF] text-white',
    icon: <IconInfo />,
  },
};

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const s = styles[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 ${s.bg} ${s.text} border rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-3 py-3 pr-2 transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
        {s.icon}
      </div>
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#0A0E1A] hover:bg-[#F5F6F8] rounded-full transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <IconClose />
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const close = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    success: (m) => show('success', m),
    error: (m) => show('error', m),
    info: (m) => show('info', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-[400px] px-4 pointer-events-none md:top-6">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => close(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
