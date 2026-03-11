# Phase 1: Backend Database Schema & Core Services Setup

## Overview
This phase establishes the foundation for the production hotel booking system with:
- Enhanced Prisma schema supporting Stripe payments and reservation holds
- Stripe payment integration with webhook handling
- WebSocket real-time updates for room changes
- Blob storage integration for room images
- Double booking prevention logic

## What's Been Added

### 1. Database Schema Updates
**File:** `backend/prisma/schema.prisma`

Added:
- `STRIPE` enum to `PaymentMethod`
- `images[]` array to `RoomType` for gallery support
- `stripePaymentIntentId` and `stripeClientSecret` fields to `Payment` model
- New `Reservation` model for 10-minute temporary booking holds

### 2. Stripe Payment Service
**File:** `backend/src/payments/stripe.service.ts`

Features:
- Create payment intents for bookings
- Retrieve payment status
- Handle webhook events (payment succeeded, failed, etc.)
- Cancel payment intents
- Construct and verify Stripe webhooks

### 3. Blob Storage Service
**File:** `backend/src/storage/blob.service.ts`

Features:
- Upload single or multiple image files
- Delete files from Blob storage
- Automatic file validation (type, size)
- Public URL generation

### 4. WebSocket Real-time Updates
**Files:** 
- `backend/src/websocket/rooms.gateway.ts` - WebSocket gateway
- `backend/src/websocket/websocket.module.ts` - Module registration

Features:
- Real-time room information broadcasts
- Room availability changes
- Price updates
- Booking status updates
- Client subscription management

### 5. Enhanced Bookings Service
**File:** `backend/src/bookings/bookings.service.ts`

New Methods:
- `checkConflicts()` - Detect date range conflicts
- `checkAvailability()` - Check multiple rooms availability
- `createReservationHold()` - Create 10-minute booking hold
- `cancelReservationHold()` - Release hold reservation

### 6. Room Image Management
**File:** `backend/src/rooms/rooms-images.controller.ts`

Endpoints:
- `POST /api/v1/rooms/images/:roomTypeId/upload` - Upload images
- `PATCH /api/v1/rooms/images/:roomTypeId/remove-image` - Remove image

### 7. Stripe Webhook Handler
**File:** `backend/src/payments/stripe.webhook.controller.ts`

Endpoints:
- `POST /api/v1/payments/webhooks/stripe` - Handle Stripe events

Handles:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

## Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_mgt

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxx

# Frontend URL (for WebSocket CORS)
FRONTEND_URL=http://localhost:3000
```

## Installation & Migration

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

This adds:
- `@nestjs/platform-socket.io` - WebSocket support
- `@nestjs/websockets` - WebSocket decorators
- `socket.io` - WebSocket library
- `stripe` - Stripe SDK
- `@vercel/blob` - Blob storage client

### 2. Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### 3. Apply Database Migration
```bash
cd backend
# For development
npx prisma migrate dev --name "add_stripe_and_reservations"

# For production
npx prisma migrate deploy
```

This creates:
- Modified `room_types` table with `images[]` array
- Modified `payments` table with Stripe fields
- New `reservations` table for temporary holds

### 4. Start Backend with WebSocket
```bash
cd backend
npm run start:dev
```

The backend will now:
- Listen on `http://localhost:4000`
- WebSocket namespace: `/rooms`
- API prefix: `/api/v1`

## Key Features Implemented

### Double Booking Prevention
```typescript
// Prevents overlapping bookings for same room
const hasConflict = await bookingsService.checkConflicts(
  roomTypeId,
  checkInDate,
  checkOutDate
);
```

Logic: `existing_checkin < new_checkout AND existing_checkout > new_checkin`

### Reservation Holds
```typescript
// Creates 10-minute hold on room
const reservation = await bookingsService.createReservationHold(
  roomTypeId,
  checkInDate,
  checkOutDate,
  sessionId,
  quantity
);
```

Automatically expires after 10 minutes to free up room inventory.

### Real-time Room Updates
```typescript
// Admin updates room → broadcast to all clients
roomsGateway.broadcastRoomUpdate({
  roomTypeId,
  name: "Luxury Suite",
  images: [...urls],
  // ... other fields
});
```

Clients subscribed to `room:${roomTypeId}` receive instant updates.

### Stripe Payment Integration
```typescript
// Create payment intent for booking
const { clientSecret } = await stripeService.createPaymentIntent(
  bookingId,
  amount,
  currency
);
```

Frontend uses `clientSecret` to confirm payment with card element.

## API Endpoints Added/Updated

### Room Image Management
- `POST /api/v1/rooms/images/:roomTypeId/upload` - Upload images
- `PATCH /api/v1/rooms/images/:roomTypeId/remove-image` - Remove image

### Payment Processing
- `POST /api/v1/payments/webhooks/stripe` - Webhook handler

### Booking Availability
- `POST /api/v1/bookings/check-availability` - Check availability (Phase 5)
- `POST /api/v1/bookings/reserve` - Create reservation hold (Phase 5)

## Testing

### Test Double Booking Prevention
```bash
# Create booking 1: Jan 1-5
# Create booking 2: Jan 3-7 (overlapping)
# Should reject booking 2
```

### Test Stripe Payment
```bash
# Create booking
# Call createPaymentIntent
# Receive clientSecret
# Use test card 4242 4242 4242 4242
# Complete payment
# Webhook updates booking status to CONFIRMED
```

### Test WebSocket Updates
```typescript
// Client A: Subscribe to room updates
socket.emit('subscribe-room', 'room-type-id');

// Admin: Update room
PATCH /api/v1/rooms/luxury-suite
{ name: "Premium Suite", images: [...] }

// Client A: Receives room-updated event automatically
```

## Next Steps

→ **Phase 2:** Admin Room Management Dashboard
- Build admin dashboard pages
- Implement real-time room editor
- Add analytics calculations

## Troubleshooting

### Database Connection Failed
- Ensure `DATABASE_URL` is correct
- Check PostgreSQL is running
- Run `npx prisma migrate reset` to reset database

### Stripe Webhook Not Working
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Test with Stripe CLI: `stripe listen --forward-to localhost:4000/api/v1/payments/webhooks/stripe`

### WebSocket Connection Issues
- Ensure backend is running on correct port
- Check CORS origins in `rooms.gateway.ts`
- Verify FRONTEND_URL environment variable

### Image Upload Failing
- Ensure `BLOB_READ_WRITE_TOKEN` is set
- Check image size < 5MB
- Verify image format (JPEG, PNG, WebP, GIF)
