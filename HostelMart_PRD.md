# Product Requirements Document (PRD)
# HostelMart — Hostel-Based Marketplace

| Field            | Detail                          |
|------------------|---------------------------------|
| **Document Version** | 1.0                         |
| **Date**             | April 24, 2026              |
| **Status**           | Draft                       |
| **Product Name**     | HostelMart                  |
| **Platform**         | Web (Mobile-First, PWA)     |

---

## 1. Product Overview

HostelMart is a hyperlocal marketplace designed exclusively for hostel residents. It enables students living in hostels to buy and sell snacks, groceries, and small daily-use items to each other through a lightweight, mobile-first web application.

Unlike traditional e-commerce platforms, HostelMart operates within a closed community — a single hostel or a cluster of hostels. Any resident can instantly become a seller without complex onboarding, and buyers can compare prices across multiple sellers listing the same item. The platform also features a **request board** where users can post items they need, allowing others to fulfill those requests — turning the marketplace into a two-way, community-driven economy.

The product prioritizes speed, simplicity, and low resource consumption to work reliably on low-end devices and average internet connections typical in hostel environments.

---

## 2. Goals and Objectives

### Primary Goals

- **Enable peer-to-peer commerce** within a hostel, reducing the need for residents to leave the campus for small purchases.
- **Provide price transparency** by allowing multiple sellers to list the same item, with default sorting by lowest price.
- **Lower the barrier to selling** — any user can become a seller in under 30 seconds with zero upfront cost.

### Secondary Goals

- Build a **community-driven request system** so that demand signals are visible and anyone can fulfill them.
- Create a **lightweight, fast platform** that works well on budget smartphones and 3G/4G connections.
- Establish a foundation that can **scale across multiple hostels** in the future.

### Business Objectives

| Objective                          | Target (First 3 Months)      |
|------------------------------------|------------------------------|
| Active users (MAU)                 | 60% of hostel residents      |
| Listings created                   | 200+ active listings         |
| Transactions facilitated           | 100+ per month               |
| Average response time (chat)       | Under 5 minutes              |
| Seller conversion rate             | 15% of registered users      |

---

## 3. Target Users

### Primary Audience

**Hostel-residing college/university students** aged 17–25 who:

- Live in on-campus or affiliated hostels.
- Frequently need snacks, instant food, toiletries, stationery, and small daily-use items.
- Are comfortable using smartphones and basic web applications.
- Have limited budgets and are price-sensitive.
- Value convenience — prefer buying from a neighbor over walking to a store.

### Secondary Audience

- **Hostel wardens or administrators** who may use the platform to monitor commercial activity within the hostel (future scope).
- **Small vendors near the campus** who may want to list items for hostel residents (future scope).

---

## 4. User Personas

### Persona 1: Rahul — The Convenience Buyer

| Attribute       | Detail                                                                 |
|-----------------|------------------------------------------------------------------------|
| Age             | 20                                                                     |
| Year            | 2nd year, B.Tech                                                       |
| Device          | Redmi Note (budget Android)                                            |
| Internet        | Hostel Wi-Fi + Jio 4G (inconsistent)                                   |
| Behavior        | Craves snacks late at night, doesn't want to go to the canteen or shop |
| Pain Point      | No easy way to know if someone nearby is selling what he needs          |
| Goal            | Find and buy items quickly from someone in the same building            |

### Persona 2: Priya — The Casual Seller

| Attribute       | Detail                                                                   |
|-----------------|--------------------------------------------------------------------------|
| Age             | 21                                                                       |
| Year            | 3rd year, B.Sc                                                           |
| Device          | Samsung Galaxy M-series                                                  |
| Behavior        | Buys snacks and groceries in bulk from the market, sells extras at a margin |
| Pain Point      | Relies on word-of-mouth and WhatsApp groups — no organized way to list items |
| Goal            | List items easily, get notified when someone wants to buy, manage stock  |

### Persona 3: Amit — The Requester

| Attribute       | Detail                                                                 |
|-----------------|------------------------------------------------------------------------|
| Age             | 19                                                                     |
| Year            | 1st year, BBA                                                          |
| Device          | Older Motorola phone                                                   |
| Behavior        | New to the hostel, doesn't know where to buy things or who sells what  |
| Pain Point      | Needs specific items urgently but doesn't know who has them             |
| Goal            | Post a request and have someone respond with availability and price    |

---

## 5. User Stories

### Buyer Stories

| ID    | Story                                                                                           | Priority |
|-------|-------------------------------------------------------------------------------------------------|----------|
| B-01  | As a buyer, I want to browse all available items on the home feed so I can see what's for sale.  | MVP      |
| B-02  | As a buyer, I want to search for a specific item by name so I can find it quickly.               | MVP      |
| B-03  | As a buyer, I want to filter items by category, price range, and availability.                   | MVP      |
| B-04  | As a buyer, I want to see all sellers offering the same item, sorted by price (lowest first).    | MVP      |
| B-05  | As a buyer, I want to view a product detail page with photos, price, seller info, and description. | MVP   |
| B-06  | As a buyer, I want to message a seller directly to negotiate or confirm a purchase.              | MVP      |
| B-07  | As a buyer, I want to post a request for an item I need but can't find listed.                   | MVP      |
| B-08  | As a buyer, I want to receive notifications when someone responds to my request.                 | V2       |
| B-09  | As a buyer, I want to rate a seller after a transaction so others can trust them.                 | V2       |
| B-10  | As a buyer, I want to save favorite items or sellers for quick access later.                      | V2       |

### Seller Stories

| ID    | Story                                                                                           | Priority |
|-------|-------------------------------------------------------------------------------------------------|----------|
| S-01  | As a user, I want to become a seller instantly by toggling a switch — no forms or approval needed. | MVP    |
| S-02  | As a seller, I want to create a listing with a photo, name, price, quantity, and category.       | MVP      |
| S-03  | As a seller, I want to manage my listings (edit, mark as sold, delete) from a dashboard.         | MVP      |
| S-04  | As a seller, I want to see incoming messages from interested buyers in one place.                 | MVP      |
| S-05  | As a seller, I want to browse the request feed and offer my items to fulfill requests.           | MVP      |
| S-06  | As a seller, I want to see basic stats — views on my listings, messages received.                | V2       |
| S-07  | As a seller, I want to duplicate a previous listing so I can relist items quickly.                | V2       |
| S-08  | As a seller, I want to set my availability status (active/away) so buyers know if I'm reachable. | V2       |

### General User Stories

| ID    | Story                                                                                           | Priority |
|-------|-------------------------------------------------------------------------------------------------|----------|
| G-01  | As a user, I want to sign up with my hostel email or phone number quickly.                       | MVP      |
| G-02  | As a user, I want to view and edit my profile (name, room number, photo).                        | MVP      |
| G-03  | As a user, I want a unified inbox for all my conversations (as buyer and seller).                | MVP      |
| G-04  | As a user, I want the app to load fast even on slow connections.                                 | MVP      |
| G-05  | As a user, I want to report a fake listing or abusive user.                                      | MVP      |

---

## 6. Feature Breakdown

### 6.1 MVP Features (Phase 1)

| Feature                     | Description                                                                                      |
|-----------------------------|--------------------------------------------------------------------------------------------------|
| **User Registration/Login** | Email or phone-based signup with OTP verification. Hostel/room number collected during onboarding. |
| **Home Feed**               | Paginated product feed showing latest and trending listings. Default sort: lowest price.          |
| **Product Listings**        | Sellers create listings with: item name, photo (camera/upload), price, quantity, category, description. |
| **Multi-Seller Comparison** | When multiple sellers list the same item (matched by name/category), they appear grouped, sorted by price. |
| **Search & Filters**        | Text-based search with filters for category, price range, and availability (in-stock only).       |
| **Product Detail Page**     | Full item view with seller info, price, description, photos, and a "Message Seller" button.      |
| **Instant Seller Mode**     | Any user can toggle "Become a Seller" from their profile. No approval, no fees. Immediate access to the seller dashboard. |
| **Seller Dashboard**        | View all active/sold listings. Edit, delete, or mark items as sold. Simple stats (views count).   |
| **In-App Messaging**        | Real-time 1:1 chat between buyer and seller. Conversation history persisted. Accessible from product page or inbox. |
| **Request Board**           | Users post item requests (item name, optional budget, urgency). Other users can respond with offers via chat. |
| **User Profile**            | Display name, room number, hostel, profile photo, seller rating (if applicable), active listings. |
| **Reporting System**        | Report button on listings and profiles for spam, fake items, or abusive behavior.                 |

### 6.2 Future Features (Phase 2 — V2)

| Feature                     | Description                                                                                      |
|-----------------------------|--------------------------------------------------------------------------------------------------|
| **Push Notifications**      | Alerts for new messages, request responses, price drops on saved items.                          |
| **Seller Ratings & Reviews**| Buyers rate sellers post-transaction; aggregate rating shown on profile.                          |
| **Favorites / Watchlist**   | Save items or sellers for quick access.                                                          |
| **Transaction History**     | Log of completed buy/sell interactions (self-reported, not payment-integrated).                   |
| **Seller Analytics**        | Dashboard with views, conversion rate, popular items.                                            |
| **Multi-Hostel Support**    | Expand scope to multiple hostels within a campus; filter by hostel.                              |
| **Admin Panel**             | Moderation tools for hostel management — approve/remove listings, ban users.                     |
| **In-App Payments (UPI)**   | Optional UPI-based payment within the chat to simplify transactions.                             |
| **Dark Mode**               | UI theme toggle for dark mode.                                                                   |
| **Listing Templates**       | Quick-list common items (Maggi, biscuits, etc.) with pre-filled details.                         |

---

## 7. User Flows

### 7.1 Buyer Flow — Finding and Buying an Item

```
1. User opens HostelMart → Home feed loads with latest listings (sorted by price).
2. User taps the search bar → Types "Maggi" → Hits search.
3. Search results show all listings matching "Maggi", sorted by lowest price.
4. User applies filter: Price ≤ ₹30, Category: Food.
5. User taps a listing → Product detail page opens.
   - Sees item photo, price (₹25), seller name (Priya, Room 204), quantity (5 packs).
6. User taps "Message Seller" → Chat window opens.
7. User sends: "Hi, can I get 2 packs? I'm in Room 112."
8. Seller responds: "Sure, come pick it up or I can drop by in 10 mins."
9. Transaction happens offline (cash/UPI). Seller marks item quantity updated or sold.
```

### 7.2 Seller Flow — Listing an Item

```
1. User opens Profile → Taps "Become a Seller" toggle → Seller mode activated instantly.
2. User navigates to Seller Dashboard → Taps "Add New Listing".
3. Fills in details:
   - Item name: "Oreo Biscuit Pack"
   - Photo: Takes photo with phone camera
   - Price: ₹30
   - Quantity: 10
   - Category: Snacks
   - Description: "Family pack, freshly bought today"
4. Taps "Publish" → Listing goes live on the marketplace immediately.
5. User receives a chat message from a buyer → Opens inbox → Responds.
6. After selling 3 packs, updates quantity to 7 from the dashboard.
7. When sold out, marks listing as "Sold Out" → Listing hidden from feed.
```

### 7.3 Request Flow — Posting and Fulfilling a Request

```
Requester:
1. User goes to the Request Feed tab → Taps "Post a Request".
2. Fills in: Item name ("Toothpaste — Colgate"), Budget (₹50), Urgency (Need today).
3. Posts the request → Appears on the Request Feed for all users.

Fulfiller:
4. Another user browsing the Request Feed sees the toothpaste request.
5. Taps "I Have This" → Chat opens with the requester.
6. Fulfiller sends: "I have Colgate 100g, ₹45. Room 308."
7. Requester agrees → They meet and exchange.
8. Requester marks request as "Fulfilled" → Request removed from feed.
```

### 7.4 Messaging Flow

```
1. Buyer taps "Message Seller" on a product page (or "I Have This" on a request).
2. Chat window opens with the product/request context auto-attached at the top.
3. Messages are sent and received in real-time (WebSocket-based).
4. Both users can access the conversation later from the Messages/Inbox tab.
5. Conversations are grouped by user, with the latest message shown as a preview.
```

---

## 8. Functional Requirements

### 8.1 Authentication & Authorization

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-01  | Users register with phone number or email. OTP-based verification required.                  |
| FR-02  | Users provide name, hostel name, and room number during onboarding.                          |
| FR-03  | Session management via JWT tokens with refresh token rotation.                               |
| FR-04  | Any authenticated user can toggle seller mode without admin approval.                        |
| FR-05  | Password reset via OTP to registered phone/email.                                            |

### 8.2 Product Listings

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-06  | Sellers can create listings with: name, description, price (₹), quantity, category, and up to 3 photos. |
| FR-07  | Listings are searchable by item name and filterable by category, price range, and availability. |
| FR-08  | When multiple sellers list items with the same name/category, the system groups them and displays sorted by price (ascending). |
| FR-09  | Sellers can edit, delete, or mark listings as sold from their dashboard.                     |
| FR-10  | Listings with zero quantity are automatically hidden from the marketplace feed.              |
| FR-11  | Each listing displays: item photo, price, seller name, seller room number, time posted.      |

### 8.3 Search & Discovery

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-12  | Full-text search across item names and descriptions.                                         |
| FR-13  | Filters: category (multi-select), price range (min–max slider), availability (in-stock only). |
| FR-14  | Sort options: price (low to high — default), price (high to low), newest first.              |
| FR-15  | Search results paginated (20 items per page, infinite scroll on mobile).                     |

### 8.4 Messaging

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-16  | 1:1 real-time messaging between any two users, initiated from a product page or request.     |
| FR-17  | Chat thread auto-attaches the product/request context (name, price, photo thumbnail).        |
| FR-18  | Message states: sent, delivered, read.                                                       |
| FR-19  | Unified inbox accessible from the bottom navigation bar.                                     |
| FR-20  | Conversations sorted by most recent message.                                                 |

### 8.5 Request Board

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-21  | Any user can post a request with: item name (required), budget (optional), urgency level (low/medium/high). |
| FR-22  | Request feed shows all open requests, sorted by newest first.                                |
| FR-23  | Other users can respond to a request via "I Have This" button, which opens a chat.           |
| FR-24  | The requester can mark a request as "Fulfilled", which removes it from the active feed.      |
| FR-25  | Requests expire automatically after 48 hours if not fulfilled.                               |

### 8.6 Seller Dashboard

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-26  | Dashboard displays: active listings, sold-out listings, and total views per listing.         |
| FR-27  | Quick actions: edit listing, update quantity, mark as sold, delete.                          |
| FR-28  | "Add New Listing" button always accessible from the dashboard.                               |

### 8.7 User Profile

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-29  | Profile displays: name, profile photo, hostel, room number, member since date.               |
| FR-30  | If the user is a seller: active listing count and seller rating (V2) shown.                  |
| FR-31  | Users can edit their profile information at any time.                                         |

### 8.8 Reporting & Moderation

| ID     | Requirement                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| FR-32  | Report button available on every listing and every user profile.                             |
| FR-33  | Report categories: fake listing, inappropriate content, spam, abusive user.                  |
| FR-34  | Reported items/users flagged for admin review (admin panel in V2).                           |
| FR-35  | Auto-hide listings after receiving 3+ reports until reviewed.                                |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Requirement                                    | Target                              |
|------------------------------------------------|--------------------------------------|
| Initial page load time                         | < 2 seconds on 4G                   |
| Time to interactive                            | < 3 seconds on 3G                   |
| API response time (95th percentile)            | < 300ms                             |
| Image loading (product photos)                 | Lazy-loaded, compressed to < 200KB  |
| Search results returned                        | < 500ms                             |
| Chat message delivery                          | < 1 second (real-time via WebSocket)|

### 9.2 Scalability

| Requirement                                    | Target                              |
|------------------------------------------------|--------------------------------------|
| Concurrent users supported                     | 500 per hostel instance              |
| Total listings supported                       | 10,000+ per instance                |
| Horizontal scaling                             | Stateless API; scale via containers  |
| Database                                       | PostgreSQL with read replicas if needed |
| Multi-hostel architecture                      | Tenant-based isolation (V2)          |

### 9.3 Security

| Requirement                                    | Detail                               |
|------------------------------------------------|--------------------------------------|
| Authentication                                 | JWT with short-lived access tokens, HTTP-only refresh tokens |
| Data encryption                                | TLS 1.3 in transit; AES-256 at rest  |
| Input validation                               | Server-side validation on all inputs; sanitize against XSS/SQL injection |
| File uploads                                   | Validate MIME type and file size (max 5MB per image); store in object storage (S3/Cloudflare R2) |
| Rate limiting                                  | 60 requests/min per user on API; 10 messages/min on chat |
| Reporting abuse                                | Auto-hide after threshold; admin review queue |
| Privacy                                        | Room numbers visible only to logged-in users within the same hostel |

### 9.4 Reliability & Availability

| Requirement                                    | Target                              |
|------------------------------------------------|--------------------------------------|
| Uptime                                         | 99.5%                                |
| Data backup                                    | Daily automated backups              |
| Error handling                                 | Graceful degradation; user-friendly error messages |
| Offline support                                | Service worker caches home feed and profile for basic offline viewing |

### 9.5 Compatibility

| Requirement                                    | Target                              |
|------------------------------------------------|--------------------------------------|
| Browsers                                       | Chrome 80+, Safari 14+, Firefox 78+, Samsung Internet |
| Devices                                        | Android 8+ (primary), iOS 14+       |
| Screen sizes                                   | 320px to 1440px (mobile-first, responsive up to tablet/desktop) |
| PWA                                            | Installable as a home-screen app; push notifications via service worker (V2) |

---

## 10. Success Metrics

### 10.1 Engagement Metrics

| Metric                              | Definition                                                  | Target (3 Months) |
|--------------------------------------|-------------------------------------------------------------|---------------------|
| Monthly Active Users (MAU)           | Unique users who open the app at least once per month        | 60% of hostel residents |
| Daily Active Users (DAU)             | Unique users who open the app daily                          | 25% of MAU         |
| Listings Created per Week            | New listings added weekly                                    | 50+                |
| Requests Posted per Week             | New item requests posted weekly                              | 20+                |
| Messages Sent per Day                | Total chat messages sent daily                               | 100+               |

### 10.2 Transaction Metrics

| Metric                              | Definition                                                  | Target (3 Months) |
|--------------------------------------|-------------------------------------------------------------|---------------------|
| Transactions per Month               | Self-reported completed purchases (via "Mark as Sold")       | 100+               |
| Request Fulfillment Rate             | % of requests marked as fulfilled within 48 hours            | 40%+               |
| Average Time to First Response       | Time from "Message Seller" to first seller reply             | < 10 minutes       |

### 10.3 Retention Metrics

| Metric                              | Definition                                                  | Target (3 Months) |
|--------------------------------------|-------------------------------------------------------------|---------------------|
| Week 1 Retention                     | % of new users returning in the first week                   | 50%+               |
| Month 1 Retention                    | % of new users returning after 30 days                       | 35%+               |
| Seller Retention                     | % of sellers who create 2+ listings in their first month     | 40%+               |

### 10.4 Quality Metrics

| Metric                              | Definition                                                  | Target              |
|--------------------------------------|-------------------------------------------------------------|---------------------|
| Report Rate                          | % of listings reported as fake/spam                          | < 5%               |
| Auto-Hidden Listings                 | Listings auto-hidden due to multiple reports                 | < 2%               |
| App Crash Rate                       | Crashes per 1,000 sessions                                   | < 5                |

---

## 11. Edge Cases & Mitigation

### 11.1 No Sellers Available

| Scenario                                        | Mitigation                                                       |
|--------------------------------------------------|------------------------------------------------------------------|
| A buyer searches for an item but no seller has it listed. | Show a friendly empty state: "No one's selling this yet. Post a request and someone might have it!" with a one-tap button to create a request. |
| New hostel with very few sellers.                | Seed the marketplace with a few early sellers via campus ambassadors. Gamify early seller signups (e.g., "First 10 sellers get featured"). |

### 11.2 Spam & Fake Listings

| Scenario                                        | Mitigation                                                       |
|--------------------------------------------------|------------------------------------------------------------------|
| A user posts fake or misleading listings.         | Report mechanism + auto-hide after 3 reports. Manual review in admin panel (V2). |
| A user floods the marketplace with duplicate listings. | Rate limit: max 10 new listings per day per seller. Duplicate detection (same name + same seller = warning). |
| Spam in the request feed.                         | Rate limit: max 5 requests per day. Auto-expire requests after 48 hours. |

### 11.3 Messaging Abuse

| Scenario                                        | Mitigation                                                       |
|--------------------------------------------------|------------------------------------------------------------------|
| A user sends abusive or harassing messages.       | Report button inside chat. Block user functionality. Repeated reports lead to account suspension. |
| A user spams multiple sellers with the same message. | Rate limit: max 10 new conversations per hour.                   |

### 11.4 Pricing & Trust Issues

| Scenario                                        | Mitigation                                                       |
|--------------------------------------------------|------------------------------------------------------------------|
| A seller lists items at unreasonably high prices. | Price transparency via multi-seller comparison. Community self-regulation (buyers choose cheaper options). |
| A buyer claims they paid but the seller denies it. | MVP relies on offline transactions (cash/UPI). V2 introduces optional in-app UPI payments for dispute resolution. |
| A seller doesn't respond to messages.             | Show "last active" timestamp on seller profiles. V2: auto-deactivate listings if seller is inactive for 7+ days. |

### 11.5 Technical Edge Cases

| Scenario                                        | Mitigation                                                       |
|--------------------------------------------------|------------------------------------------------------------------|
| User loses internet mid-chat.                    | Messages queued locally and sent when connection restores. Offline indicator shown. |
| Image upload fails due to poor connectivity.      | Client-side image compression before upload. Retry mechanism with progress indicator. Allow listing creation without a photo. |
| User is on a very old or low-end device.          | Progressive enhancement: core functionality works without JS-heavy features. Minimal CSS animations. |

---

## 12. Page Specifications

### 12.1 Home (Product Feed)

**Purpose:** Primary landing page showing all available items.

**Components:** Top search bar, category filter chips (horizontal scroll), product cards in a vertical list/grid, floating "Post Request" button, bottom navigation bar.

**Product Card Contents:** Item thumbnail, item name, price (₹), seller name, room number, time posted.

**Default Behavior:** Sorted by lowest price. Infinite scroll pagination. Pull-to-refresh.

---

### 12.2 Search Results

**Purpose:** Display items matching the user's search query and filters.

**Components:** Search bar (pre-filled with query), active filter tags, sort dropdown (price low-high, price high-low, newest), results list (same card format as home).

**Empty State:** "No items found. Try a different search or post a request!"

---

### 12.3 Product Detail Page

**Purpose:** Full view of a single listing with seller info and purchase action.

**Components:** Image carousel (up to 3 photos), item name, price, quantity available, category tag, description, seller card (name, photo, room number, member since), "Message Seller" button (primary CTA), "Report Listing" link, "Other Sellers" section (if the same item is listed by others — shows a comparison list sorted by price).

---

### 12.4 Chat / Messages

**Purpose:** Real-time messaging between buyer and seller.

**Inbox View:** List of all conversations, sorted by most recent. Each row shows: other user's photo, name, last message preview, timestamp, unread badge.

**Chat View:** Message bubbles (sent/received). Product or request context card pinned at the top. Text input with send button. Timestamp grouping (today, yesterday, date).

---

### 12.5 Request Feed

**Purpose:** Community board where users post items they need.

**Components:** List of open requests. Each request card shows: item name, budget (if set), urgency tag (low/medium/high), requester name, time posted. "I Have This" button on each card. Floating "Post Request" button. Filter by urgency or category.

---

### 12.6 Seller Dashboard

**Purpose:** Central hub for sellers to manage their inventory and listings.

**Components:** Summary stats bar (active listings count, total views, messages received). Tabbed view: Active Listings | Sold Out. Each listing card shows: item thumbnail, name, price, quantity, views, edit/delete actions. "Add New Listing" button (prominent).

---

### 12.7 User Profile

**Purpose:** View and edit personal information; access seller mode.

**Components:** Profile photo (editable), name, hostel, room number, member since date. "Become a Seller" toggle (if not already a seller). If seller: link to seller dashboard, active listing count. Settings: edit profile, notification preferences, logout. "Report User" link (visible on other users' profiles).

---

## 13. Design Requirements

### Visual Design

- **Style:** Clean, minimal, and functional. No visual clutter. Content-first approach.
- **Typography:** System font stack for performance. Clear hierarchy with 3 levels: heading, subheading, body.
- **Colors:** Neutral base (white/light gray) with a single accent color for CTAs and interactive elements. High contrast for readability.
- **Spacing:** Generous padding and whitespace. Touch targets minimum 44x44px.

### Mobile-First

- Designed for 360px–414px viewport widths as the primary experience.
- Bottom navigation bar with 4–5 tabs: Home, Search, Requests, Messages, Profile.
- Responsive scaling up to tablet and desktop, but mobile is the priority.

### Performance-Oriented Design

- Skeleton screens instead of spinners during loading.
- Lazy-loaded images with low-res placeholders.
- Minimal use of animations — only for meaningful transitions (page entry, message send).
- No heavy frameworks or libraries in the critical render path.

---

## 14. Technical Architecture (Recommended)

### Frontend

- **Framework:** React (Next.js) or Vue (Nuxt) for SSR and fast initial loads.
- **Styling:** Tailwind CSS for lightweight, utility-first styling.
- **PWA:** Service worker for caching, offline support, and home-screen installation.
- **State Management:** Lightweight (Zustand or Pinia) — no heavy state libraries.

### Backend

- **Runtime:** Node.js (Express or Fastify) or Python (FastAPI).
- **Database:** PostgreSQL (primary), Redis (caching, session management, real-time pub/sub).
- **Real-Time:** WebSocket (Socket.io or native WS) for chat.
- **File Storage:** Cloudflare R2 or AWS S3 for product images.
- **Search:** PostgreSQL full-text search (MVP); Meilisearch or Typesense (V2).
- **Authentication:** JWT + OTP via Twilio or similar SMS/email provider.

### Deployment

- **Hosting:** Vercel (frontend) + Railway or Render (backend) for MVP.
- **CI/CD:** GitHub Actions.
- **Monitoring:** Sentry for error tracking, Plausible or PostHog for analytics.

---

## 15. Constraints & Assumptions

### Constraints

- The platform does **not** handle payments in MVP. All transactions are offline (cash, UPI, etc.).
- No identity verification beyond phone/email OTP. Trust is community-based.
- Single hostel deployment in MVP. Multi-hostel support is V2.
- Image storage limited to 3 photos per listing, max 5MB each.
- No native mobile apps in MVP — PWA only.

### Assumptions

- Hostel residents have smartphones with internet access (Wi-Fi or mobile data).
- Users are willing to meet in person for item exchange (hyperlocal assumption).
- The hostel community is small enough (100–500 residents) that trust and reputation naturally develop.
- University/hostel administration is neutral or supportive of the platform.

---

## 16. Risks & Dependencies

| Risk                                             | Likelihood | Impact | Mitigation                                                    |
|--------------------------------------------------|------------|--------|---------------------------------------------------------------|
| Low initial adoption — not enough sellers         | High       | High   | Seed with campus ambassadors. Incentivize first 20 sellers.   |
| Spam and fake listings degrade trust              | Medium     | High   | Reporting + auto-hide. Admin moderation in V2.                |
| Hostel Wi-Fi outages affect usability             | Medium     | Medium | Offline caching via service worker. Lightweight pages.        |
| Disputes over transactions (no payment tracking)  | Medium     | Medium | Clear disclaimer: "HostelMart facilitates discovery, not payment." In-app payments in V2. |
| Users migrate back to WhatsApp groups             | Medium     | High   | Offer features WhatsApp can't: search, price comparison, request board. |

---

## Appendix: Category Taxonomy (MVP)

| Category        | Example Items                                       |
|-----------------|-----------------------------------------------------|
| Snacks          | Chips, biscuits, chocolates, namkeen, instant noodles |
| Beverages       | Soft drinks, juice, tea/coffee sachets, water bottles |
| Groceries       | Rice, dal, sugar, oil, bread, eggs                   |
| Toiletries      | Toothpaste, soap, shampoo, sanitizer, tissues        |
| Stationery      | Pens, notebooks, sticky notes, markers, calculators  |
| Electronics     | Chargers, earphones, USB cables, power banks         |
| Daily Essentials| Medicines (OTC), mosquito repellent, room freshener  |
| Other           | Anything that doesn't fit the above categories       |

---

*End of Document*
