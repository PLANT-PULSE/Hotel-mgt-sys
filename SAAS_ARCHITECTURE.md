# Enterprise SaaS Booking Platform – Architecture

## Overview

Multi-tenant booking platform supporting hotels, guest houses, resorts, event centers, and car rentals. Built on Next.js 16 (frontend) + NestJS (API) + PostgreSQL/Prisma.

## Tenant Model

Each **Business** is an isolated tenant with:
- Unique `slug` (path routing: `/luxestay`)
- Optional `subdomain` (`luxestay.platform.com`)
- Optional `customDomain` (white-label)
- Separate rooms, bookings, staff, payments, analytics

```
Platform
├── Super Admin (platform-wide)
└── Businesses (tenants)
    ├── Business Owner
    ├── Staff (Manager, Receptionist, Cleaner)
    └── Customers (global accounts, tenant-scoped bookings)
```

## Role Matrix

| Role | Scope | Capabilities |
|------|-------|--------------|
| SUPER_ADMIN | Platform | Manage businesses, subscriptions, broadcasts, emergency alerts |
| BUSINESS_OWNER | Tenant | Full business management, staff, payments, analytics |
| MANAGER | Tenant | Bookings, rooms, reports, approve bookings |
| RECEPTIONIST | Tenant | Check-in/out, create bookings |
| CLEANER | Tenant | Update room status |
| CUSTOMER | Global | Book, review, favorites, profile |

## Routing

| Pattern | Example | Resolution |
|---------|---------|--------------|
| Path-based | `/luxestay/rooms` | `middleware.ts` → `x-tenant-slug` header |
| Subdomain | `luxestay.app.com` | Host header → tenant slug |
| Custom domain | `book.luxestay.com` | `Business.customDomain` lookup |

## Database Schema (Key Models)

- `Business` – tenant entity with white-label settings
- `BusinessMember` – user ↔ business role mapping
- `Subscription` – SaaS billing (Basic/Premium/Enterprise)
- `ActivityLog` – security & audit trail (IP, browser, action, status)
- `Review`, `Favorite`, `Invoice`, `Refund`, `PaymentLink`
- `ApiKey`, `Webhook`, `Affiliate` – public API & affiliate system
- `ChatSession`, `ChatMessage` – AI chatbot history

All tenant data includes `businessId` FK for row-level isolation.

## Security

- **Argon2id** password hashing (bcrypt legacy support)
- **Account lockout** after 3 failed logins (1 hour)
- **JWT** access tokens (15 min) + refresh tokens (7 days)
- **Rate limiting** via NestJS ThrottlerGuard
- **Activity logging** for logins, failures, admin actions
- **Emergency alerts** on suspicious activity

## API Structure

```
NestJS Backend (port 4000)
/api/v1/auth          – register, login, refresh, password reset
/api/v1/businesses    – CRUD, search, platform stats
/api/v1/bookings      – availability, locks, bookings
/api/v1/payments      – checkout, Stripe, payment links
/api/v1/activity-logs – audit trail, broadcasts

Next.js BFF (port 3000)
/api/ai/chat          – Groq streaming chatbot (server-side only)
/api/super-admin/*    – platform admin proxy
/api/payments/*       – Paystack initialize/verify
```

## Implemented Features (Phase 1)

- [x] Multi-tenant Prisma schema
- [x] Business CRUD + suspend/restore/delete
- [x] Super Admin dashboard + business management
- [x] Platform stats (businesses, revenue, bookings)
- [x] Activity logs + emergency alerts
- [x] Argon2 + account lockout
- [x] AI chatbot (Groq, streaming, topic filtering)
- [x] Email templates (Resend)
- [x] Customer auth (signup, login, forgot password)
- [x] Tenant middleware (path + subdomain)
- [x] Smart business search API

## Phase 2 (Next Steps)

- [ ] Tenant-scoped queries in all existing services
- [ ] NextAuth integration with JWT bridge
- [ ] Payment link generation + Paystack DB persistence
- [ ] Review system UI + moderation
- [ ] Invoice PDF generation
- [ ] Subscription billing (Stripe Billing)
- [ ] Public REST API + webhooks
- [ ] Multi-language (i18n) + multi-currency display
- [ ] Affiliate dashboard
- [ ] Refund workflow UI
- [ ] Unit & integration tests
- [ ] API documentation (Swagger export)

## Getting Started

```bash
# Backend
cd backend
cp .env.example .env   # set DATABASE_URL
npm install --legacy-peer-deps
npx prisma migrate dev --name saas_foundation
npm run prisma:seed
npm run start:dev

# Frontend
cd ..
cp .env.example .env.local
npm install
npm run dev
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@platform.com | Password123! |
| Business Owner | admin@luxehotel.com | Password123! |
| Customer | guest@example.com | Password123! |

### URLs

- Platform home: http://localhost:3000
- Tenant site: http://localhost:3000/luxestay
- Super Admin: http://localhost:3000/super-admin/login
- Business Admin: http://localhost:3000/admin-login
- API Docs: http://localhost:4000/api/docs
