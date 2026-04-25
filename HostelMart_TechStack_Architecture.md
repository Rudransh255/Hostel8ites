# Tech Stack & System Architecture
# HostelMart — Hostel-Based Marketplace

| Field            | Detail                              |
|------------------|-------------------------------------|
| **Document Version** | 1.0                             |
| **Date**             | April 24, 2026                  |
| **Status**           | Draft                           |
| **Companion Doc**    | HostelMart_PRD.md               |

---

## 1. Recommended Tech Stack

### 1.1 Stack Overview

| Layer                  | Technology                        | Why This Choice                                                      |
|------------------------|-----------------------------------|----------------------------------------------------------------------|
| **Frontend**           | Next.js 14+ (React)               | SSR for fast first load, file-based routing, API routes built-in     |
| **Styling**            | Tailwind CSS                      | Utility-first, tiny bundle, no custom CSS files to manage            |
| **State Management**   | Zustand                           | Lightweight (~1KB), simple API, no boilerplate                       |
| **Backend**            | Node.js + Express.js              | Beginner-friendly, massive ecosystem, same language as frontend      |
| **Database**           | PostgreSQL                        | Relational data (users→listings→messages), strong querying, free-tier available |
| **ORM**                | Prisma                            | Type-safe queries, auto-generated migrations, great DX               |
| **Authentication**     | NextAuth.js (Auth.js)             | Built-in OTP/email providers, session management, zero-cost          |
| **Real-Time Chat**     | Socket.io                         | WebSocket abstraction with fallback to polling, easy to implement    |
| **File Storage**       | Cloudflare R2                     | S3-compatible, generous free tier (10GB), no egress fees             |
| **Image Processing**   | Sharp (server-side)               | Fast compression/resizing before upload, keeps storage costs low     |
| **Search**             | PostgreSQL Full-Text Search       | No extra service needed for MVP; upgrade to Meilisearch in V2        |
| **Caching**            | Redis (Upstash)                   | Serverless Redis with free tier; caches hot queries and sessions     |
| **Hosting (Frontend)** | Vercel                            | Free tier, auto-deploys from GitHub, edge network, built for Next.js |
| **Hosting (Backend)**  | Railway                           | Simple Node.js hosting, free trial, easy Postgres/Redis add-ons     |
| **CI/CD**              | GitHub Actions                    | Free for public repos, simple YAML config                            |
| **Monitoring**         | Sentry (errors) + PostHog (analytics) | Both have generous free tiers                                   |

### 1.2 Frontend Stack — Detail

```
Next.js 14+
├── App Router (file-based routing)
├── Server Components (fast initial renders, less client JS)
├── Client Components (interactive elements: chat, forms, filters)
├── next/image (automatic image optimization and lazy loading)
├── next-pwa (service worker for offline support and installability)
│
├── Tailwind CSS
│   ├── Utility classes (no separate CSS files)
│   ├── @apply for reusable component styles
│   └── Dark mode support via class strategy (V2)
│
├── Zustand (state management)
│   ├── useAuthStore (user session, role)
│   ├── useChatStore (active conversations, unread counts)
│   ├── useFilterStore (search filters, sort preferences)
│   └── useListingStore (draft listing form state)
│
├── Socket.io Client (real-time chat)
│
└── React Hook Form + Zod (form handling + validation)
```

**Why Next.js over plain React, Vue, or others:**

- Server-Side Rendering (SSR) means the home feed loads with content already in the HTML — critical for slow connections and low-end devices.
- API Routes let you build lightweight backend endpoints inside the same project, reducing infrastructure for MVP.
- The `next/image` component handles lazy loading, WebP conversion, and responsive sizing automatically — important when every listing has product photos.
- Huge community and documentation makes it beginner-friendly despite being production-grade.

### 1.3 Backend Stack — Detail

```
Node.js + Express.js
├── REST API (versioned: /api/v1/...)
├── Middleware
│   ├── Authentication (JWT verification)
│   ├── Rate Limiting (express-rate-limit)
│   ├── Input Validation (Zod schemas)
│   ├── Error Handling (centralized error middleware)
│   └── CORS (configured for frontend origin)
│
├── Prisma ORM
│   ├── Schema-first design (schema.prisma)
│   ├── Auto-generated TypeScript types
│   ├── Migrations (prisma migrate)
│   └── Prisma Studio (visual DB browser for debugging)
│
├── Socket.io Server (attached to Express HTTP server)
│   ├── Namespace: /chat
│   ├── Authentication middleware (verify JWT on connection)
│   └── Redis adapter (for horizontal scaling)
│
├── Multer + Sharp (file upload + image processing)
│   ├── Accept: JPEG, PNG, WebP (max 5MB raw)
│   ├── Sharp: resize to 800px max width, compress to WebP, target < 200KB
│   └── Upload processed image to Cloudflare R2
│
└── Node-Cron (scheduled jobs)
    ├── Expire stale requests (older than 48 hours)
    └── Deactivate inactive seller listings (7+ days, V2)
```

**Why Express.js over Fastify, Hono, or others:**

- Express is the most documented Node.js framework in existence. Any problem a beginner hits has a Stack Overflow answer.
- Middleware ecosystem is massive: rate limiting, CORS, file uploads, validation — all plug-and-play.
- Performance is sufficient for 500 concurrent users (our hostel scale). Fastify is faster but the difference is negligible at this scale.

### 1.4 Database — SQL vs NoSQL Decision

| Factor                     | PostgreSQL (SQL) ✅                              | MongoDB (NoSQL) ❌                              |
|----------------------------|--------------------------------------------------|--------------------------------------------------|
| Data relationships         | Users → Listings → Messages → Requests are all relational. SQL handles this natively with JOINs and foreign keys. | Requires manual reference management or denormalization. |
| Price sorting & filtering  | `ORDER BY price ASC` with indexes is trivial and fast. | Requires secondary indexes; sorting across collections is complex. |
| Multi-seller comparison    | `WHERE item_name = 'Maggi' ORDER BY price` — one query. | Requires aggregation pipeline or application-level sorting. |
| Full-text search           | Built-in `tsvector` + `tsquery` — good enough for MVP. | MongoDB Atlas Search exists but adds complexity. |
| Data integrity             | Foreign keys ensure a listing always belongs to a valid user. Cascading deletes clean up related data. | No built-in referential integrity. |
| Transactions               | ACID transactions for operations like "mark as sold + update quantity" atomically. | Multi-document transactions exist but are slower and less intuitive. |
| Free hosting               | Supabase (500MB), Neon (512MB), Railway — all offer free PostgreSQL. | MongoDB Atlas free tier (512MB) is comparable. |
| ORM support                | Prisma has first-class PostgreSQL support with migrations. | Prisma supports MongoDB but with some limitations. |

**Decision: PostgreSQL.** The data is inherently relational, price-based sorting and filtering are core to the product, and SQL's querying power makes the codebase simpler. MongoDB would require more application-level code to achieve the same results.

---

## 2. Architecture Design

### 2.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Next.js Frontend (PWA)                     │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │   │
│   │  │  Home    │  │  Search  │  │  Chat    │  │Profile │  │   │
│   │  │  Feed    │  │  Results │  │  Inbox   │  │  Page  │  │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │   │
│   └──────────────────────┬──────────────────────────────────┘   │
│                          │                                      │
│              ┌───────────┴───────────┐                          │
│              │  HTTPS (REST API)     │  WSS (Socket.io)         │
│              │  Port 443             │  Port 443                │
│              └───────────┬───────────┘                          │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    SERVER LAYER                                  │
│                                                                  │
│   ┌──────────────────────┴──────────────────────────────────┐   │
│   │              Node.js + Express Server                    │   │
│   │                                                          │   │
│   │  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐  │   │
│   │  │  REST API    │   │  Socket.io   │   │  Scheduled  │  │   │
│   │  │  Controllers │   │  Server      │   │  Jobs       │  │   │
│   │  └──────┬───────┘   └──────┬───────┘   └──────┬──────┘  │   │
│   │         │                  │                   │         │   │
│   │  ┌──────┴──────────────────┴───────────────────┴──────┐  │   │
│   │  │              Middleware Layer                       │  │   │
│   │  │  Auth │ Rate Limit │ Validation │ Error Handler    │  │   │
│   │  └──────────────────────┬────────────────────────────┘  │   │
│   │                         │                                │   │
│   │  ┌──────────────────────┴────────────────────────────┐  │   │
│   │  │              Prisma ORM                            │  │   │
│   │  └──────────────────────┬────────────────────────────┘  │   │
│   └─────────────────────────┼────────────────────────────────┘  │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────┐
│                       DATA LAYER                                  │
│                                                                   │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐    │
│   │  PostgreSQL  │   │  Redis       │   │  Cloudflare R2   │    │
│   │              │   │  (Upstash)   │   │  (Image Storage) │    │
│   │  - Users     │   │              │   │                  │    │
│   │  - Listings  │   │  - Sessions  │   │  - Product       │    │
│   │  - Messages  │   │  - Cache     │   │    Photos        │    │
│   │  - Requests  │   │  - Chat      │   │  - Profile       │    │
│   │  - Reports   │   │    Presence  │   │    Avatars       │    │
│   └──────────────┘   └──────────────┘   └──────────────────┘    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 2.2 Client-Server Interaction

The frontend and backend communicate through two channels:

**Channel 1 — REST API (HTTPS):** Handles all CRUD operations: user registration, login, creating/editing/deleting listings, searching products, posting requests, fetching profiles, and reporting. Every request includes a JWT in the `Authorization` header. The API is stateless — any server instance can handle any request.

**Channel 2 — WebSocket (Socket.io):** Handles real-time chat exclusively. When a user opens the app, a persistent WebSocket connection is established. The JWT is verified during the Socket.io handshake. Messages are sent and received instantly through this channel. If the WebSocket fails (poor connectivity), Socket.io automatically falls back to HTTP long-polling.

```
User Action              → Channel    → Server Handling
─────────────────────────────────────────────────────────
Browse listings          → REST GET   → Query DB, return JSON
Create a listing         → REST POST  → Validate, save to DB, upload image to R2
Search for "Maggi"       → REST GET   → Full-text search query, return results
Send a chat message      → WebSocket  → Broadcast to recipient, save to DB
Receive a chat message   → WebSocket  → Push to client, update unread count
Toggle seller mode       → REST PATCH → Update user role in DB
Post a request           → REST POST  → Save to DB, visible on request feed
Report a listing         → REST POST  → Save report, check threshold for auto-hide
```

### 2.3 API Structure (REST)

The API follows RESTful conventions with versioned endpoints. All responses use a consistent JSON envelope.

**Response Envelope:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  },
  "error": null
}
```

**Endpoint Map:**

| Method | Endpoint                          | Description                              | Auth Required |
|--------|-----------------------------------|------------------------------------------|---------------|
| POST   | `/api/v1/auth/register`           | Register with phone/email + OTP          | No            |
| POST   | `/api/v1/auth/verify-otp`         | Verify OTP and issue JWT                 | No            |
| POST   | `/api/v1/auth/refresh`            | Refresh access token                     | Yes (refresh) |
| GET    | `/api/v1/users/me`                | Get current user's profile               | Yes           |
| PATCH  | `/api/v1/users/me`                | Update profile (name, room, photo)       | Yes           |
| PATCH  | `/api/v1/users/me/role`           | Toggle seller mode on/off                | Yes           |
| GET    | `/api/v1/users/:id`               | Get another user's public profile        | Yes           |
| GET    | `/api/v1/listings`                | Browse listings (paginated, filterable)  | Yes           |
| GET    | `/api/v1/listings/search`         | Full-text search with filters            | Yes           |
| GET    | `/api/v1/listings/:id`            | Get single listing with seller info      | Yes           |
| POST   | `/api/v1/listings`                | Create a new listing (seller only)       | Yes (seller)  |
| PATCH  | `/api/v1/listings/:id`            | Edit listing (owner only)                | Yes (seller)  |
| DELETE | `/api/v1/listings/:id`            | Delete listing (owner only)              | Yes (seller)  |
| GET    | `/api/v1/listings/compare/:name`  | Get all sellers for a given item name    | Yes           |
| GET    | `/api/v1/seller/dashboard`        | Seller's listings with stats             | Yes (seller)  |
| GET    | `/api/v1/requests`                | Browse open requests                     | Yes           |
| POST   | `/api/v1/requests`                | Post an item request                     | Yes           |
| PATCH  | `/api/v1/requests/:id/fulfill`    | Mark request as fulfilled (owner only)   | Yes           |
| DELETE | `/api/v1/requests/:id`            | Delete a request (owner only)            | Yes           |
| GET    | `/api/v1/conversations`           | List all conversations for current user  | Yes           |
| GET    | `/api/v1/conversations/:id`       | Get messages in a conversation           | Yes           |
| POST   | `/api/v1/reports`                 | Report a listing or user                 | Yes           |
| POST   | `/api/v1/upload/image`            | Upload and process an image              | Yes           |

**Query Parameters for `GET /api/v1/listings`:**

| Parameter    | Type     | Default     | Example                         |
|-------------|----------|-------------|----------------------------------|
| `page`      | integer  | 1           | `?page=2`                        |
| `limit`     | integer  | 20          | `?limit=10`                      |
| `sort`      | string   | `price_asc` | `?sort=price_desc` or `newest`   |
| `category`  | string   | all         | `?category=snacks`               |
| `price_min` | number   | 0           | `?price_min=10`                  |
| `price_max` | number   | none        | `?price_max=100`                 |
| `in_stock`  | boolean  | true        | `?in_stock=true`                 |

### 2.4 Real-Time Messaging Flow

```
SENDER (Client A)                  SERVER                     RECEIVER (Client B)
      │                              │                              │
      │  1. User taps "Send"         │                              │
      │──── socket.emit('message',   │                              │
      │     { conversationId,        │                              │
      │       text, timestamp })     │                              │
      │                              │                              │
      │                    2. Server receives event                 │
      │                    3. Validate JWT (already verified        │
      │                       during handshake)                     │
      │                    4. Validate message content              │
      │                       (length, sanitize)                    │
      │                    5. Save to PostgreSQL                    │
      │                       (messages table)                      │
      │                    6. Check if recipient is online          │
      │                       (Redis presence map)                  │
      │                              │                              │
      │  7. Emit 'message:ack'       │  8. Emit 'message:new'      │
      │◄─────────────────────────────│─────────────────────────────►│
      │  (confirms sent + msg ID)    │  (delivers the message)     │
      │                              │                              │
      │                              │  9. Client B renders message │
      │                              │ 10. Client B emits           │
      │                              │◄──── 'message:read'          │
      │                              │      { messageId }           │
      │                              │                              │
      │ 11. Emit 'message:status'    │                              │
      │◄─────────────────────────────│                              │
      │  (status: 'read')            │                              │
```

**Socket.io Events:**

| Event              | Direction       | Payload                                         | Purpose                          |
|--------------------|-----------------|--------------------------------------------------|----------------------------------|
| `connection`       | Client → Server | JWT in handshake auth                            | Establish WebSocket connection   |
| `message:send`     | Client → Server | `{ conversationId, text, timestamp }`            | Send a new message               |
| `message:ack`      | Server → Client | `{ messageId, status: 'sent' }`                  | Confirm message was saved        |
| `message:new`      | Server → Client | `{ messageId, conversationId, senderId, text, timestamp }` | Deliver message to recipient |
| `message:read`     | Client → Server | `{ messageId }`                                  | Mark a message as read           |
| `message:status`   | Server → Client | `{ messageId, status: 'delivered'|'read' }`      | Update sender on delivery/read   |
| `user:online`      | Server → Client | `{ userId }`                                     | Notify that a contact came online|
| `user:offline`     | Server → Client | `{ userId }`                                     | Notify that a contact went offline|
| `typing:start`     | Client → Server | `{ conversationId }`                             | Show typing indicator            |
| `typing:stop`      | Client → Server | `{ conversationId }`                             | Hide typing indicator            |
| `disconnect`       | Auto            | —                                                | Clean up presence, mark offline  |

**Offline Message Handling:** If the recipient is offline (not in the Redis presence map), the message is still saved to PostgreSQL. When the recipient reconnects, the client fetches unread messages via `GET /api/v1/conversations/:id?after=lastSeenTimestamp`. This keeps the architecture simple — no message queues needed at hostel scale.

---

## 3. Database Design

### 3.1 Entity Relationship Diagram (Textual)

```
┌──────────┐       ┌──────────────┐       ┌──────────────────┐
│  users   │──1:N──│  listings    │──N:1──│  categories      │
│          │       │              │       │                  │
│          │──1:N──│  requests    │       └──────────────────┘
│          │       └──────────────┘
│          │       ┌──────────────┐
│          │──1:N──│  messages    │
│          │       └──────┬───────┘
│          │              │ N:1
│          │       ┌──────┴───────┐
│          │──N:N──│conversations │
│          │       └──────────────┘
│          │       ┌──────────────┐
│          │──1:N──│  reports     │
└──────────┘       └──────────────┘
```

### 3.2 Table Schemas

#### `users`

| Column          | Type         | Constraints                          | Notes                              |
|-----------------|-------------|--------------------------------------|------------------------------------|
| `id`            | UUID         | PK, default `gen_random_uuid()`      | Primary identifier                 |
| `name`          | VARCHAR(100) | NOT NULL                             | Display name                       |
| `email`         | VARCHAR(255) | UNIQUE, nullable                     | Optional login method              |
| `phone`         | VARCHAR(15)  | UNIQUE, nullable                     | Primary login method               |
| `password_hash` | VARCHAR(255) | nullable                             | Null if using OTP-only auth        |
| `avatar_url`    | TEXT         | nullable                             | Cloudflare R2 URL                  |
| `hostel_name`   | VARCHAR(100) | NOT NULL                             | Hostel identifier                  |
| `room_number`   | VARCHAR(20)  | NOT NULL                             | Room within hostel                 |
| `role`          | ENUM         | DEFAULT 'buyer'                      | Values: `buyer`, `seller`          |
| `is_active`     | BOOLEAN      | DEFAULT true                         | Soft-delete / suspension flag      |
| `last_seen_at`  | TIMESTAMP    | nullable                             | Last activity timestamp            |
| `created_at`    | TIMESTAMP    | DEFAULT NOW()                        | Registration date                  |
| `updated_at`    | TIMESTAMP    | DEFAULT NOW(), ON UPDATE             | Last profile update                |

**Indexes:** `idx_users_email` (UNIQUE), `idx_users_phone` (UNIQUE), `idx_users_hostel` (for multi-hostel filtering in V2).

---

#### `categories`

| Column          | Type         | Constraints                          | Notes                              |
|-----------------|-------------|--------------------------------------|------------------------------------|
| `id`            | SERIAL       | PK                                   | Auto-increment integer             |
| `name`          | VARCHAR(50)  | UNIQUE, NOT NULL                     | e.g., "Snacks", "Toiletries"       |
| `slug`          | VARCHAR(50)  | UNIQUE, NOT NULL                     | URL-safe: "snacks", "toiletries"   |
| `icon`          | VARCHAR(10)  | nullable                             | Emoji or icon code                 |

**Seeded with:** Snacks, Beverages, Groceries, Toiletries, Stationery, Electronics, Daily Essentials, Other.

---

#### `listings`

| Column          | Type          | Constraints                         | Notes                              |
|-----------------|--------------|-------------------------------------|------------------------------------|
| `id`            | UUID          | PK, default `gen_random_uuid()`     | Primary identifier                 |
| `seller_id`     | UUID          | FK → users.id, NOT NULL             | Who created this listing           |
| `category_id`   | INTEGER       | FK → categories.id, NOT NULL        | Item category                      |
| `title`         | VARCHAR(150)  | NOT NULL                            | Item name (searchable)             |
| `description`   | TEXT          | nullable                            | Optional details                   |
| `price`         | DECIMAL(10,2) | NOT NULL, CHECK (price > 0)         | Price in INR                       |
| `quantity`       | INTEGER       | NOT NULL, DEFAULT 1, CHECK (qty ≥ 0)| Available stock                    |
| `images`        | TEXT[]        | nullable                            | Array of R2 URLs (max 3)           |
| `status`        | ENUM          | DEFAULT 'active'                    | Values: `active`, `sold_out`, `hidden`, `deleted` |
| `views_count`   | INTEGER       | DEFAULT 0                           | Incremented on product page view   |
| `report_count`  | INTEGER       | DEFAULT 0                           | Auto-hide at 3+                    |
| `created_at`    | TIMESTAMP     | DEFAULT NOW()                       | When listed                        |
| `updated_at`    | TIMESTAMP     | DEFAULT NOW(), ON UPDATE            | Last edit                          |

**Indexes:** `idx_listings_price` (for sort), `idx_listings_category` (for filter), `idx_listings_seller` (for dashboard), `idx_listings_title_trgm` (GIN index for full-text search using `pg_trgm`), `idx_listings_status` (partial index WHERE status = 'active').

**Key query this schema optimizes:**

```sql
-- "Show me all Maggi listings, cheapest first"
SELECT l.*, u.name AS seller_name, u.room_number
FROM listings l
JOIN users u ON l.seller_id = u.id
WHERE l.title ILIKE '%maggi%'
  AND l.status = 'active'
  AND l.quantity > 0
ORDER BY l.price ASC
LIMIT 20 OFFSET 0;
```

---

#### `requests`

| Column          | Type          | Constraints                         | Notes                              |
|-----------------|--------------|-------------------------------------|------------------------------------|
| `id`            | UUID          | PK                                  | Primary identifier                 |
| `user_id`       | UUID          | FK → users.id, NOT NULL             | Who posted the request             |
| `item_name`     | VARCHAR(150)  | NOT NULL                            | What they need                     |
| `budget`        | DECIMAL(10,2) | nullable                            | Max they're willing to pay         |
| `urgency`       | ENUM          | DEFAULT 'medium'                    | Values: `low`, `medium`, `high`    |
| `status`        | ENUM          | DEFAULT 'open'                      | Values: `open`, `fulfilled`, `expired` |
| `expires_at`    | TIMESTAMP     | DEFAULT NOW() + INTERVAL '48 hours' | Auto-expiry timestamp              |
| `created_at`    | TIMESTAMP     | DEFAULT NOW()                       |                                    |

**Indexes:** `idx_requests_status` (partial, WHERE status = 'open'), `idx_requests_expires` (for cleanup job).

---

#### `conversations`

| Column          | Type          | Constraints                         | Notes                              |
|-----------------|--------------|-------------------------------------|------------------------------------|
| `id`            | UUID          | PK                                  | Primary identifier                 |
| `participant_1` | UUID          | FK → users.id, NOT NULL             | One party                          |
| `participant_2` | UUID          | FK → users.id, NOT NULL             | Other party                        |
| `listing_id`    | UUID          | FK → listings.id, nullable          | Context: which listing initiated this chat |
| `request_id`    | UUID          | FK → requests.id, nullable          | Context: which request initiated this chat |
| `last_message_at`| TIMESTAMP    | nullable                            | For sorting inbox by recency       |
| `created_at`    | TIMESTAMP     | DEFAULT NOW()                       |                                    |

**Unique constraint:** `UNIQUE(participant_1, participant_2, listing_id)` — prevents duplicate conversations about the same listing between the same two users.

**Indexes:** `idx_conversations_participants` (composite on participant_1, participant_2), `idx_conversations_last_msg` (for inbox sorting).

---

#### `messages`

| Column            | Type          | Constraints                         | Notes                              |
|-------------------|--------------|-------------------------------------|------------------------------------|
| `id`              | UUID          | PK                                  | Primary identifier                 |
| `conversation_id` | UUID          | FK → conversations.id, NOT NULL     | Which conversation                 |
| `sender_id`       | UUID          | FK → users.id, NOT NULL             | Who sent it                        |
| `text`            | TEXT          | NOT NULL, CHECK(length > 0)         | Message content                    |
| `status`          | ENUM          | DEFAULT 'sent'                      | Values: `sent`, `delivered`, `read`|
| `created_at`      | TIMESTAMP     | DEFAULT NOW()                       | Sent timestamp                     |

**Indexes:** `idx_messages_conversation_created` (composite, for fetching conversation history in order), `idx_messages_unread` (partial, WHERE status != 'read', for unread counts).

---

#### `reports`

| Column          | Type          | Constraints                         | Notes                              |
|-----------------|--------------|-------------------------------------|------------------------------------|
| `id`            | UUID          | PK                                  | Primary identifier                 |
| `reporter_id`   | UUID          | FK → users.id, NOT NULL             | Who filed the report               |
| `target_type`   | ENUM          | NOT NULL                            | Values: `listing`, `user`          |
| `target_id`     | UUID          | NOT NULL                            | ID of the reported listing or user |
| `reason`        | ENUM          | NOT NULL                            | Values: `fake`, `spam`, `inappropriate`, `abusive` |
| `description`   | TEXT          | nullable                            | Optional details                   |
| `status`        | ENUM          | DEFAULT 'pending'                   | Values: `pending`, `reviewed`, `dismissed` |
| `created_at`    | TIMESTAMP     | DEFAULT NOW()                       |                                    |

**Unique constraint:** `UNIQUE(reporter_id, target_type, target_id)` — one report per user per target.

---

### 3.3 Prisma Schema (Abridged)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  buyer
  seller
}

enum ListingStatus {
  active
  sold_out
  hidden
  deleted
}

enum Urgency {
  low
  medium
  high
}

enum MessageStatus {
  sent
  delivered
  read
}

model User {
  id           String    @id @default(uuid())
  name         String
  email        String?   @unique
  phone        String?   @unique
  passwordHash String?   @map("password_hash")
  avatarUrl    String?   @map("avatar_url")
  hostelName   String    @map("hostel_name")
  roomNumber   String    @map("room_number")
  role         UserRole  @default(buyer)
  isActive     Boolean   @default(true) @map("is_active")
  lastSeenAt   DateTime? @map("last_seen_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  listings     Listing[]
  requests     Request[]
  sentMessages Message[] @relation("sender")
  reports      Report[]  @relation("reporter")

  @@map("users")
}

model Listing {
  id          String        @id @default(uuid())
  sellerId    String        @map("seller_id")
  categoryId  Int           @map("category_id")
  title       String
  description String?
  price       Decimal       @db.Decimal(10, 2)
  quantity    Int           @default(1)
  images      String[]
  status      ListingStatus @default(active)
  viewsCount  Int           @default(0) @map("views_count")
  reportCount Int           @default(0) @map("report_count")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  seller      User          @relation(fields: [sellerId], references: [id])
  category    Category      @relation(fields: [categoryId], references: [id])

  @@index([price])
  @@index([categoryId])
  @@index([sellerId])
  @@map("listings")
}
```

---

## 4. Key Technical Decisions

### 4.1 Decision Matrix

| Decision                       | Choice Made           | Alternatives Considered          | Rationale                                                                 |
|--------------------------------|-----------------------|----------------------------------|---------------------------------------------------------------------------|
| Frontend framework             | Next.js               | Create React App, Vite + React, Nuxt (Vue) | SSR for performance on slow connections; API routes reduce infra complexity; best docs and ecosystem. |
| Backend framework              | Express.js            | Fastify, NestJS, Hono            | Simplest learning curve, largest middleware ecosystem. NestJS is over-engineered for this scale. |
| Database                       | PostgreSQL            | MongoDB, SQLite, MySQL           | Relational data demands SQL. PostgreSQL has the best free tiers and full-text search built in. |
| ORM                            | Prisma                | Drizzle, Sequelize, Knex         | Best developer experience (auto types, migrations, studio). Drizzle is lighter but less beginner-friendly. |
| Real-time                      | Socket.io             | WebSocket (native), Pusher, Ably | Socket.io handles fallbacks (polling) automatically. Self-hosted, no third-party costs. |
| Auth                           | NextAuth.js + JWT     | Firebase Auth, Supabase Auth, Clerk | NextAuth is free, open-source, and integrates natively with Next.js. No vendor lock-in. |
| Image storage                  | Cloudflare R2         | AWS S3, Firebase Storage, Supabase Storage | Zero egress fees (critical for image-heavy marketplace). S3-compatible API. 10GB free. |
| Caching                        | Upstash Redis         | In-memory (Node), Memcached      | Serverless pricing (pay per request), free tier covers MVP. Enables Socket.io adapter for scaling. |
| Hosting (frontend)             | Vercel                | Netlify, Cloudflare Pages        | Best-in-class Next.js hosting (made by the same team). Free tier covers MVP traffic. |
| Hosting (backend)              | Railway               | Render, Fly.io, DigitalOcean     | One-click Postgres and Redis. Simple deploy from GitHub. Affordable at scale. |
| Search                         | PostgreSQL `pg_trgm`  | Meilisearch, Algolia, Elasticsearch | No extra service to run. `pg_trgm` with GIN indexes handles fuzzy search for 10K listings. Upgrade in V2. |

### 4.2 Trade-Offs Acknowledged

| Trade-Off                                      | Accepted Because                                                        |
|------------------------------------------------|-------------------------------------------------------------------------|
| Express is slower than Fastify                 | Negligible at hostel scale (< 500 users). DX and ecosystem matter more. |
| PostgreSQL full-text search is less powerful than Meilisearch | Sufficient for 10K listings. Avoids running a separate search service. |
| Socket.io adds overhead vs raw WebSocket       | Auto-fallback to polling is critical for unreliable hostel Wi-Fi.       |
| No in-app payments in MVP                      | Reduces complexity and regulatory burden. Most hostel transactions are cash/UPI anyway. |
| JWT in memory (no HTTP-only cookie for API)     | Simpler implementation. Acceptable risk for a hostel-internal app.      |
| Images processed server-side (Sharp)            | Adds server CPU load, but ensures consistent quality and file sizes.    |

---

## 5. Performance Considerations

### 5.1 Caching Strategy

| What to Cache                     | Where         | TTL          | Invalidation                            |
|-----------------------------------|---------------|--------------|------------------------------------------|
| Listing feed (home page)          | Redis         | 60 seconds   | Invalidate on new listing or edit        |
| Category list                     | Redis         | 24 hours     | Rarely changes; manual invalidate        |
| Search results (popular queries)  | Redis         | 30 seconds   | Short TTL handles freshness              |
| User profile (own)                | Client state  | Session      | Re-fetch on profile edit                 |
| User profile (others)             | Redis         | 5 minutes    | Invalidate on profile update             |
| Conversation list (inbox)         | Client state  | Real-time    | Updated via WebSocket events             |
| Product images                    | CDN (R2)      | 30 days      | New URL on image re-upload               |

**Cache-Aside Pattern (Pseudocode):**

```javascript
async function getListings(filters) {
  const cacheKey = `listings:${JSON.stringify(filters)}`;
  
  // 1. Check Redis
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // 2. Query database
  const listings = await prisma.listing.findMany({
    where: buildWhereClause(filters),
    orderBy: { price: 'asc' },
    include: { seller: { select: { name: true, roomNumber: true } } },
    take: 20,
    skip: (filters.page - 1) * 20,
  });
  
  // 3. Store in Redis
  await redis.set(cacheKey, JSON.stringify(listings), { ex: 60 });
  
  return listings;
}
```

### 5.2 Lazy Loading

| Element                  | Strategy                                                              |
|--------------------------|-----------------------------------------------------------------------|
| Product images           | `next/image` with `loading="lazy"` and blurred placeholder            |
| Listing feed             | Infinite scroll via Intersection Observer; load 20 items per batch     |
| Chat history             | Load last 30 messages on open; "Load older" button fetches previous batch |
| Request feed             | Same infinite scroll as listing feed                                  |
| Profile avatars in lists | Tiny thumbnails (40x40px) loaded lazily; full avatar only on profile page |
| Non-critical JS          | Dynamic imports for seller dashboard, report modal, image upload      |

**Next.js Dynamic Import Example:**

```javascript
// Seller dashboard is only loaded when a seller accesses it
const SellerDashboard = dynamic(() => import('@/components/SellerDashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false, // Client-only — no need to SSR the dashboard
});
```

### 5.3 Image Optimization Pipeline

```
User takes photo (phone camera)
       │
       ▼
Client-side preview (no upload yet)
       │
       ▼
Upload raw image to POST /api/v1/upload/image
       │
       ▼
Server receives file (Multer, max 5MB)
       │
       ▼
Sharp processes the image:
  ├── Resize: max 800px width (maintain aspect ratio)
  ├── Format: convert to WebP
  ├── Quality: 80%
  └── Output: typically 100-200KB
       │
       ▼
Upload processed image to Cloudflare R2
       │
       ▼
Return R2 public URL to client
       │
       ▼
URL stored in listings.images[] array
```

**Why this matters:** A raw phone photo is 3-8MB. With 1,000 listings averaging 2 photos each, that's 6-16GB of uncompressed storage. After Sharp processing, the same data is ~200-400MB — a 20-40x reduction. Load times drop from 3-5 seconds per image on 3G to under 500ms.

### 5.4 Bundle Optimization

| Technique                       | Implementation                                                      |
|---------------------------------|---------------------------------------------------------------------|
| Tree shaking                    | Next.js default; unused code removed at build time                  |
| Code splitting                  | Automatic per-page splitting by App Router                          |
| Font optimization               | `next/font` for self-hosted font loading (no FOUT)                  |
| Critical CSS                    | Tailwind purges unused classes; typically < 10KB CSS total           |
| Compression                     | Brotli compression on Vercel edge (automatic)                       |
| Service Worker                  | `next-pwa` caches app shell, home feed, and profile for offline use |

**Target Bundle Sizes:**

| Asset              | Target   |
|--------------------|----------|
| First Load JS      | < 80KB   |
| CSS                | < 10KB   |
| Largest page chunk  | < 50KB   |
| Time to Interactive (4G) | < 2s |
| Time to Interactive (3G) | < 4s |

---

## 6. Security Considerations

### 6.1 Authentication & Authorization

```
Registration & Login Flow:
─────────────────────────

1. User enters phone number → POST /api/v1/auth/register
2. Server generates 6-digit OTP → Stored in Redis (key: otp:{phone}, TTL: 5 min)
3. OTP sent via SMS (Twilio / MSG91) or email (Resend)
4. User enters OTP → POST /api/v1/auth/verify-otp
5. Server verifies OTP against Redis
6. On success:
   ├── Generate Access Token (JWT, 15 min expiry, contains userId + role)
   ├── Generate Refresh Token (opaque, 7-day expiry, stored in DB)
   └── Return both tokens to client
7. Client stores Access Token in memory (Zustand store)
8. Client stores Refresh Token in HTTP-only, Secure, SameSite=Strict cookie

Token Refresh Flow:
───────────────────
1. Access Token expires → API returns 401
2. Client sends Refresh Token cookie to POST /api/v1/auth/refresh
3. Server validates Refresh Token against DB
4. Issue new Access Token + rotate Refresh Token
5. Old Refresh Token invalidated (prevents reuse)
```

**Authorization Middleware:**

```javascript
// Role-based access control
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions. Seller access required.' 
      });
    }
    next();
  };
}

// Usage
router.post('/listings', authenticate, requireRole('seller'), createListing);
router.get('/listings', authenticate, getListings); // Any authenticated user
```

### 6.2 Input Validation

All user inputs are validated on both client and server using Zod schemas.

```javascript
// Shared validation schema (used on both client and server)
const createListingSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title must be under 150 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(10000, 'Price cannot exceed ₹10,000'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Must have at least 1 item')
    .max(999, 'Maximum quantity is 999'),
  categoryId: z.number().int().positive(),
});
```

**Additional Protections:**

| Threat                  | Mitigation                                                              |
|------------------------|-------------------------------------------------------------------------|
| SQL Injection          | Prisma uses parameterized queries by default; no raw SQL in user paths  |
| XSS (Cross-Site Script)| React auto-escapes JSX output; `DOMPurify` for any user-generated HTML  |
| CSRF                   | SameSite=Strict cookies; API checks Origin header                       |
| File upload attacks    | Multer validates MIME type (image/jpeg, image/png, image/webp only); Sharp re-encodes (strips metadata and embedded payloads); max 5MB |
| Brute-force OTP        | Rate limit: 3 OTP attempts per phone per 15 minutes; exponential backoff|

### 6.3 Spam & Fake Listing Prevention

| Mechanism                              | Implementation                                                   |
|----------------------------------------|------------------------------------------------------------------|
| **Listing rate limit**                 | Max 10 new listings per seller per day (tracked in Redis)        |
| **Duplicate detection**               | Before publishing, check if the same seller has an active listing with a similar title (Levenshtein distance < 3). Warn, don't block. |
| **Report threshold**                  | 3 reports on a listing → auto-set status to `hidden`. Notify admin queue. |
| **Request rate limit**                | Max 5 open requests per user at any time                         |
| **Message rate limit**                | Max 10 new conversations per user per hour; max 30 messages per conversation per hour |
| **Account age gate (V2)**             | New accounts can only create 3 listings in first 24 hours        |
| **Content moderation (V2)**           | Basic keyword filter for prohibited items (alcohol, tobacco, etc.) |

### 6.4 Data Privacy

- Room numbers are visible only to authenticated users within the same hostel (enforced by API middleware).
- Chat messages are stored encrypted at rest (PostgreSQL column-level encryption for `messages.text`, V2).
- Users can delete their account, which cascades to soft-delete all listings and anonymize messages.
- No data shared with third parties. Analytics (PostHog) configured to anonymize IPs.

---

## 7. Scalability Plan

### 7.1 Scaling Phases

```
Phase 1: Single Hostel (MVP)
────────────────────────────
Users: ~100-500
Listings: ~1,000-5,000
Architecture: Single server, single database

┌────────────┐     ┌────────────┐     ┌────────────┐
│  Vercel    │     │  Railway   │     │  Railway   │
│  (Next.js) │────▶│  (Express) │────▶│ (Postgres) │
└────────────┘     │  + Socket  │     └────────────┘
                   └─────┬──────┘
                         │
                   ┌─────┴──────┐
                   │  Upstash   │
                   │  (Redis)   │
                   └────────────┘

Phase 2: Multi-Hostel (~5-10 hostels)
─────────────────────────────────────
Users: ~1,000-5,000
Listings: ~10,000-50,000
Architecture: Add tenant isolation, read replicas

┌────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  Vercel    │     │  Railway (2 instances)│   │  Postgres       │
│  (Next.js) │────▶│  ┌──────┐ ┌──────┐ │────▶│  Primary + Read │
└────────────┘     │  │ API 1│ │ API 2│ │     │  Replica        │
                   │  └──────┘ └──────┘ │     └─────────────────┘
                   └────────┬───────────┘
                            │
                   ┌────────┴───────────┐
                   │  Redis (shared)    │
                   │  Socket.io adapter │
                   └────────────────────┘

Phase 3: Campus-Wide (~50+ hostels)
────────────────────────────────────
Users: ~10,000-50,000
Architecture: Containerized, horizontally scaled

┌────────────┐     ┌─────────────────────────┐     ┌──────────────┐
│  Vercel /  │     │  Kubernetes / ECS        │     │  Postgres    │
│  CDN       │────▶│  ┌───┐ ┌───┐ ┌───┐      │────▶│  + Citus     │
└────────────┘     │  │Pod│ │Pod│ │Pod│ ...   │     │  (sharded)   │
                   │  └───┘ └───┘ └───┘      │     └──────────────┘
                   └───────────┬─────────────┘
                               │
                   ┌───────────┴─────────────┐
                   │  Redis Cluster           │
                   │  + Meilisearch           │
                   │  + Message Queue (BullMQ)│
                   └─────────────────────────┘
```

### 7.2 Multi-Tenancy Strategy (Phase 2)

**Approach: Shared database with tenant column.**

Every table gets a `hostel_id` column. All queries include `WHERE hostel_id = ?` as a mandatory filter. This is enforced at the Prisma middleware level so developers can't accidentally forget it.

```javascript
// Prisma middleware — auto-inject hostel_id filter
prisma.$use(async (params, next) => {
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      hostelId: currentUser.hostelId, // From JWT
    };
  }
  return next(params);
});
```

**Why not separate databases per hostel?** At the 5-10 hostel scale, separate databases add operational complexity (migrations, backups, connection pools) without meaningful performance benefit. A single Postgres instance handles 50K listings easily. Separate databases make sense only at Phase 3 scale (1,000+ hostels), where sharding (e.g., Citus) becomes warranted.

### 7.3 What Changes at Each Phase

| Component         | Phase 1 (MVP)                | Phase 2 (Multi-Hostel)         | Phase 3 (Campus-Wide)           |
|-------------------|------------------------------|--------------------------------|----------------------------------|
| Server instances  | 1                            | 2-3 behind load balancer       | Auto-scaled pods (K8s/ECS)       |
| Database          | Single Postgres              | Primary + 1 read replica       | Sharded (Citus) or Aurora        |
| Search            | PostgreSQL `pg_trgm`         | PostgreSQL `pg_trgm`           | Meilisearch (dedicated)          |
| Caching           | Upstash Redis (serverless)   | Upstash Redis (pro plan)       | Redis Cluster (self-hosted)      |
| Chat scaling      | Single Socket.io server      | Socket.io + Redis adapter      | Socket.io + Redis adapter + sticky sessions |
| File storage      | Cloudflare R2                | Cloudflare R2                  | Cloudflare R2 (scales infinitely)|
| Background jobs   | Node-Cron (in-process)       | Node-Cron (in-process)         | BullMQ (dedicated worker pods)   |
| Monitoring        | Sentry + PostHog free        | Sentry + PostHog free          | Datadog / Grafana + Prometheus   |

---

## 8. Deployment Plan

### 8.1 Environment Setup

| Environment  | Purpose                          | URL                              | Hosting               |
|-------------|----------------------------------|----------------------------------|------------------------|
| Local       | Development                       | `http://localhost:3000` (FE), `http://localhost:4000` (API) | Developer machine |
| Staging     | QA and pre-production testing     | `staging.hostelmart.app`         | Vercel Preview + Railway Dev |
| Production  | Live users                        | `hostelmart.app`                 | Vercel + Railway       |

### 8.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  # ──────────────────────────────────────
  # Job 1: Lint, Type-Check, Test
  # ──────────────────────────────────────
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint          # ESLint
      - run: npm run type-check    # TypeScript compiler (no emit)
      - run: npm run test          # Vitest unit tests

  # ──────────────────────────────────────
  # Job 2: Database Migration Check
  # ──────────────────────────────────────
  db-check:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - run: npx prisma validate   # Schema is valid
      - run: npx prisma migrate diff --exit-code  # No pending migrations

  # ──────────────────────────────────────
  # Job 3: Deploy Frontend (Vercel)
  # ──────────────────────────────────────
  deploy-frontend:
    if: github.ref == 'refs/heads/main'
    needs: [quality, db-check]
    runs-on: ubuntu-latest
    steps:
      # Vercel auto-deploys from GitHub — this job
      # just gates it behind passing tests.
      - run: echo "Vercel deploys automatically on push to main"

  # ──────────────────────────────────────
  # Job 4: Deploy Backend (Railway)
  # ──────────────────────────────────────
  deploy-backend:
    if: github.ref == 'refs/heads/main'
    needs: [quality, db-check]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railwayapp/cli-action@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          command: up --service backend
```

**Pipeline Flow:**

```
Developer pushes code to GitHub
       │
       ▼
GitHub Actions triggers
       │
       ├── Lint (ESLint) ──────────────── Fail? → Block merge
       ├── Type Check (tsc) ───────────── Fail? → Block merge
       ├── Unit Tests (Vitest) ─────────── Fail? → Block merge
       ├── Prisma Schema Validation ────── Fail? → Block merge
       │
       ▼ All pass
       │
       ├── Push to `main` branch
       │   ├── Vercel auto-deploys frontend
       │   ├── Railway deploys backend
       │   └── Prisma runs pending migrations
       │
       └── Pull Request
           └── Vercel creates preview deployment (unique URL for QA)
```

### 8.3 Deployment Architecture

```
                    ┌──────────────────────────────────┐
                    │          CLOUDFLARE               │
                    │     (DNS + CDN + DDoS Protection) │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────┴───────────────────┐
                    │                                   │
             ┌──────┴──────┐                    ┌──────┴──────┐
             │   VERCEL    │                    │   RAILWAY   │
             │  (Frontend) │                    │  (Backend)  │
             │             │                    │             │
             │  Next.js    │───── API calls ───▶│  Express.js │
             │  SSR + CDN  │◀── responses ──────│  Socket.io  │
             │  Static     │                    │             │
             │  Assets     │                    │  Services:  │
             └─────────────┘                    │  ┌────────┐ │
                                                │  │Postgres│ │
                                                │  └────────┘ │
                                                │  ┌────────┐ │
                                                │  │ Redis  │ │
                                                │  └────────┘ │
                                                └──────┬──────┘
                                                       │
                                                ┌──────┴──────┐
                                                │CLOUDFLARE R2│
                                                │  (Images)   │
                                                └─────────────┘
```

### 8.4 Cost Estimate (MVP — First 6 Months)

| Service            | Plan        | Monthly Cost   | Notes                                    |
|--------------------|-------------|----------------|------------------------------------------|
| Vercel             | Hobby (Free)| $0             | 100GB bandwidth, serverless functions    |
| Railway            | Starter     | ~$5            | 512MB RAM, shared CPU, Postgres included |
| Upstash Redis      | Free        | $0             | 10K commands/day                         |
| Cloudflare R2      | Free        | $0             | 10GB storage, 10M reads/month            |
| Cloudflare (DNS)   | Free        | $0             | DNS + basic DDoS protection              |
| SMS OTP (MSG91)    | Pay-as-go   | ~$2-5          | ~500 OTPs/month at ₹0.20-0.30 each      |
| Sentry             | Free        | $0             | 5K errors/month                          |
| PostHog            | Free        | $0             | 1M events/month                          |
| GitHub             | Free        | $0             | Unlimited public/private repos           |
| **Total**          |             | **~$5-10/mo**  | Production-ready for a single hostel     |

---

## 9. Development Roadmap

### 9.1 Sprint Plan (2-Week Sprints)

| Sprint | Duration   | Deliverables                                                        |
|--------|------------|---------------------------------------------------------------------|
| 0      | Week 1-2   | Project setup: repo, Next.js + Express scaffold, Prisma schema, Railway deploy, CI/CD pipeline |
| 1      | Week 3-4   | Auth: OTP registration, login, JWT flow, protected routes, user profile page |
| 2      | Week 5-6   | Listings: create listing (with image upload), home feed, product detail page, seller dashboard |
| 3      | Week 7-8   | Search & filters: full-text search, category/price filters, sort options, infinite scroll |
| 4      | Week 9-10  | Chat: Socket.io integration, conversation list, message send/receive, product context in chat |
| 5      | Week 11-12 | Requests: request board, post request, "I Have This" flow, auto-expiry. Reporting system. |
| 6      | Week 13-14 | Polish: loading skeletons, error states, empty states, PWA setup, performance optimization |
| 7      | Week 15-16 | Testing: end-to-end tests, load testing, security audit, bug fixes, soft launch to beta users |

### 9.2 Folder Structure

```
hostelmart/
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── app/                    # App Router pages
│   │   │   ├── (auth)/             # Login, register, verify OTP
│   │   │   ├── (main)/             # Authenticated layout
│   │   │   │   ├── page.tsx        # Home feed
│   │   │   │   ├── search/         # Search results
│   │   │   │   ├── listing/[id]/   # Product detail
│   │   │   │   ├── messages/       # Chat inbox + conversation
│   │   │   │   ├── requests/       # Request feed
│   │   │   │   ├── dashboard/      # Seller dashboard
│   │   │   │   └── profile/        # User profile
│   │   │   └── layout.tsx          # Root layout
│   │   ├── components/             # Reusable UI components
│   │   ├── lib/                    # API client, utils, hooks
│   │   ├── stores/                 # Zustand stores
│   │   └── public/                 # Static assets
│   │
│   └── api/                        # Express.js backend
│       ├── src/
│       │   ├── controllers/        # Route handlers
│       │   ├── middleware/          # Auth, validation, rate-limit
│       │   ├── services/           # Business logic
│       │   ├── socket/             # Socket.io event handlers
│       │   ├── utils/              # Helpers (image processing, etc.)
│       │   └── index.ts            # Server entry point
│       └── prisma/
│           ├── schema.prisma       # Database schema
│           ├── migrations/         # Migration files
│           └── seed.ts             # Seed data (categories, test users)
│
├── packages/
│   └── shared/                     # Shared Zod schemas, types, constants
│       ├── schemas/                # Validation schemas (used by FE + BE)
│       └── types/                  # TypeScript interfaces
│
├── .github/workflows/              # CI/CD
├── package.json                    # Monorepo root (npm workspaces)
└── README.md
```

---

## 10. Monitoring & Observability

### 10.1 Monitoring Stack

| Layer           | Tool                  | What It Tracks                                    |
|-----------------|-----------------------|--------------------------------------------------|
| Error tracking  | Sentry                | Unhandled exceptions, failed API calls, stack traces |
| Analytics       | PostHog               | Page views, feature usage, conversion funnels     |
| Uptime          | Better Uptime (free)  | Ping monitoring for API and frontend endpoints    |
| Logs            | Railway (built-in)    | Application logs, request logs, deploy logs       |
| Performance     | Vercel Analytics (free)| Core Web Vitals (LCP, FID, CLS) per page         |
| Database        | Prisma Metrics        | Query duration, connection pool usage             |

### 10.2 Key Alerts (Configure in Sentry)

| Alert Condition                        | Severity | Action                                 |
|----------------------------------------|----------|----------------------------------------|
| Error rate > 5% of requests            | Critical | Investigate immediately                |
| API response time p95 > 1 second       | Warning  | Check database queries, add indexes    |
| WebSocket disconnection rate > 20%     | Warning  | Check server memory, connection limits |
| Image upload failure rate > 10%        | Warning  | Check R2 connectivity, file size limits|
| 0 new listings in 24 hours             | Info     | Community health check — engagement issue |

---

## Appendix A: Environment Variables

```bash
# ────────────────────────────────
# Frontend (.env.local)
# ────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.hostelmart.app
NEXT_PUBLIC_WS_URL=wss://api.hostelmart.app
NEXT_PUBLIC_R2_PUBLIC_URL=https://images.hostelmart.app
NEXTAUTH_URL=https://hostelmart.app
NEXTAUTH_SECRET=<random-32-char-string>

# ────────────────────────────────
# Backend (.env)
# ────────────────────────────────
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/hostelmart

# Redis
REDIS_URL=redis://default:pass@host:6379

# JWT
JWT_ACCESS_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudflare R2
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=hostelmart-images
R2_PUBLIC_URL=https://images.hostelmart.app

# SMS (MSG91)
MSG91_AUTH_KEY=<msg91-auth-key>
MSG91_TEMPLATE_ID=<otp-template-id>

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Appendix B: Quick Reference — "What Goes Where?"

| Question a Developer Might Ask                  | Answer                                              |
|--------------------------------------------------|-----------------------------------------------------|
| Where do I add a new API endpoint?               | `apps/api/src/controllers/` + register in router     |
| Where do I add a new page?                       | `apps/web/app/(main)/new-page/page.tsx`              |
| Where do I add a shared validation schema?       | `packages/shared/schemas/`                           |
| Where do I add a new database table?             | `apps/api/prisma/schema.prisma` → `npx prisma migrate dev` |
| Where do I add a new Socket.io event?            | `apps/api/src/socket/handlers.ts`                    |
| Where do I add a new Zustand store?              | `apps/web/stores/useNewStore.ts`                     |
| Where do I add a reusable UI component?          | `apps/web/components/`                               |
| How do I test locally?                           | `npm run dev` (starts both FE and API via Turborepo) |
| How do I deploy?                                 | Push to `main` branch → CI/CD handles everything     |
| How do I run database migrations?                | `cd apps/api && npx prisma migrate dev`              |
| How do I seed test data?                         | `cd apps/api && npx prisma db seed`                  |

---

*End of Document*
