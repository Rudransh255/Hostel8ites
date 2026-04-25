// ─── API Response Envelope ──────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

// ─── User Types ─────────────────────────────────────

export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  hostelName: string;
  roomNumber: string;
  role: UserRole;
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  avatarUrl?: string;
  hostelName: string;
  roomNumber: string;
  role: UserRole;
  createdAt: string;
}

// ─── Listing Types ──────────────────────────────────

export type ListingStatus = 'active' | 'sold_out' | 'hidden' | 'deleted';

export interface Listing {
  id: string;
  sellerId: string;
  categoryId: number;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  images: string[];
  status: ListingStatus;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  seller?: PublicUser;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

// ─── Request Types ──────────────────────────────────

export type Urgency = 'low' | 'medium' | 'high';
export type RequestStatus = 'open' | 'fulfilled' | 'expired';

export interface ItemRequest {
  id: string;
  userId: string;
  itemName: string;
  budget?: number;
  urgency: Urgency;
  status: RequestStatus;
  expiresAt: string;
  createdAt: string;
  user?: PublicUser;
}

// ─── Conversation Types ─────────────────────────────

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  listingId?: string;
  requestId?: string;
  lastMessageAt?: string;
  createdAt: string;
  participant1?: PublicUser;
  participant2?: PublicUser;
  listing?: Listing;
  request?: ItemRequest;
  lastMessage?: Message;
  unreadCount?: number;
}

// ─── Message Types ──────────────────────────────────

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  status: MessageStatus;
  createdAt: string;
}

// ─── Report Types ───────────────────────────────────

export type ReportTargetType = 'listing' | 'user';
export type ReportReason = 'fake' | 'spam' | 'inappropriate' | 'abusive';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}
