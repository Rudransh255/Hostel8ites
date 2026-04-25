'use client';

import { create } from 'zustand';

interface ChatState {
  conversations: Array<{
    id: string;
    participantName: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
  }>;
  activeConversationId: string | null;
  totalUnread: number;

  // Actions
  setConversations: (convs: ChatState['conversations']) => void;
  setActiveConversation: (id: string | null) => void;
  updateUnreadCount: (conversationId: string, count: number) => void;
  addMessage: (conversationId: string, message: string, timestamp: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  totalUnread: 0,

  setConversations: (conversations) =>
    set({
      conversations,
      totalUnread: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    }),

  setActiveConversation: (activeConversationId) => set({ activeConversationId }),

  updateUnreadCount: (conversationId, count) =>
    set((state) => {
      const conversations = state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: count } : c
      );
      return {
        conversations,
        totalUnread: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
      };
    }),

  addMessage: (conversationId, message, timestamp) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: message, lastMessageAt: timestamp }
          : c
      ),
    })),
}));
