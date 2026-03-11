# Phase 5: API Endpoints & Stripe Integration - Complete Implementation

## Overview
Phase 5 implements a complete REST API with Stripe payment processing, including booking creation, payment handling, and webhook integration.

## API Endpoints

### 1. Rooms Endpoints

#### GET /api/v1/rooms
Fetch all available room types with optional availability checking.

**Query Parameters:**
- `checkIn` (optional): ISO date string for check-in date
- `checkOut` (optional): ISO date string for check-out date
- `guests` (optional): Number of guests

**Response:**
```json
[
  {
    "id": "room-123",
    "name": "Luxury Suite",
    "type": "suite",
    "basePrice": 450.00,
    "size": "65m²",
    "maxGuests": 4,
    "beds": 2,
    "amenities": ["Wi-Fi", "Mini Bar", "Jacuzzi"],
    "description": "Luxurious suite with city views",
    "images": ["url1", "url2"],
    "totalUnits": 5,
    "available": true,
    "availableUnits": 3
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### GET /api/v1/rooms/:id
Fetch specific room details.

**Response:**
```json
{
  "id": "room-123",
  "name": "Luxury Suite",
  "type": "suite",
  "basePrice": 450.00,
  "size": "65m²",
  "maxGuests": 4,
  "beds": 2,
  "amenities": ["Wi-Fi", "Mini Bar", "Jacuzzi"],
  "description": "Luxurious suite with city views",
  "images": ["url1", "url2"],
  "totalUnits": 5
}
```

**Status Codes:**
- 200: Success
- 404: Room not found
- 500: Server error

#### POST /api/v1/rooms/:id/availability
Check room availability for specific dates.

**Request Body:**
```json
{
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-25",
  "quantity": 2
}
```

**Response:**
```json
{
  "roomId": "room-123",
  "roomName": "Luxury Suite",
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-25",
  "requestedQuantity": 2,
  "totalUnits": 5,
  "bookedUnits": 3,
  "availableUnits": 2,
  "isAvailable": true
}
```

**Status Codes:**
- 200: Success
- 400: Invalid input or no availability
- 404: Room not found
- 500: Server error

### 2. Booking Endpoints

#### POST /api/v1/bookings
Create a new booking with Stripe payment intent.

**Request Body:**
```json
{
  "roomTypeId": "room-123",
  "quantity": 1,
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-25",
  "guestFirstName": "John",
  "guestLastName": "Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "specialRequests": "Early check-in if possible",
  "promoCodeId": "promo-123",
  "addOns": [
    {
      "addOnId": "addon-breakfast",
      "quantity": 5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking-456",
    "bookingNumber": "LXS-2024-ABC12",
    "checkInDate": "2024-12-20T00:00:00Z",
    "checkOutDate": "2024-12-25T00:00:00Z",
    "totalAmount": 2250.00,
    "guestEmail": "john@example.com",
    "status": "PENDING"
  },
  "payment": {
    "id": "payment-789",
    "clientSecret": "pi_abc123_secret_xyz789",
    "amount": 2250.00,
    "currency": "USD"
  }
}
```

**Status Codes:**
- 201: Booking created successfully
- 400: Validation error or unavailable rooms
- 404: Room not found
- 500: Server error

#### POST /api/v1/bookings/confirm
Confirm booking after successful payment.

**Request Body:**
```json
{
  "bookingId": "booking-456",
  "paymentIntentId": "pi_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking-456",
    "bookingNumber": "LXS-2024-ABC12",
    "status": "CONFIRMED",
    "checkInDate": "2024-12-20T00:00:00Z",
    "checkOutDate": "2024-12-25T00:00:00Z",
    "totalAmount": 2250.00,
    "guestEmail": "john@example.com"
  },
  "message": "Booking confirmed successfully. Confirmation email sent."
}
```

**Status Codes:**
- 200: Booking confirmed
- 400: Payment not completed
- 500: Server error

### 3. Payment Endpoints

#### POST /api/v1/payments/create-payment-intent
Create or retrieve a Stripe payment intent for a booking.

**Request Body:**
```json
{
  "bookingId": "booking-456"
}
```

**Response:**
```json
{
  "clientSecret": "pi_abc123_secret_xyz789",
  "paymentIntentId": "pi_abc123",
  "amount": 2250.00,
  "currency": "usd",
  "bookingNumber": "LXS-2024-ABC12"
}
```

**Status Codes:**
- 200: Payment intent created/retrieved
- 400: Invalid booking ID
- 404: Booking not found
- 500: Server error

### 4. Webhook Endpoints

#### POST /api/v1/webhooks/stripe
Stripe webhook for handling payment events.

**Handled Events:**
- `payment_intent.succeeded` - Payment completed, booking confirmed
- `payment_intent.payment_failed` - Payment failed, booking cancelled
- `charge.refunded` - Charge refunded, payment marked as refunded

**Requirements:**
- Must include valid Stripe signature in header
- Signature verified against `STRIPE_WEBHOOK_SECRET`

**Response:**
- 200: Event processed successfully
- 400: Invalid signature
- 500: Processing error

## Database Schema Integration

### Key Tables Used:

**RoomType**
- Stores room type definitions
- Tracks availability with `totalUnits`
- Stores images and amenities

**Booking**
- Creates booking records with unique booking number
- Tracks guest information
- Links to BookingItem for room details
- Tracks booking status

**BookingItem**
- Associates specific room types with bookings
- Stores pricing at time of booking
- Tracks quantity reserved

**Payment**
- Stores payment information
- Tracks Stripe payment intent ID
- Stores client secret for frontend
- Updates on webhook events

**Reservation** (Temporary Holds)
- For future real-time inventory management
- Holds rooms for 10 minutes during checkout

## Stripe Integration

### Setup Requirements:

**Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Payment Flow:

1. **Create Booking**
   - User submits booking form
   - Backend creates booking + payment intent
   - Returns clientSecret and paymentIntentId

2. **Collect Payment**
   - Frontend loads Stripe Elements
   - User enters payment details
   - Frontend confirms payment with clientSecret

3. **Webhook Confirmation**
   - Stripe sends webhook for payment success/failure
   - Backend updates payment and booking status
   - Confirmation email sent to guest

4. **Booking Confirmation**
   - Frontend confirms payment completion
   - Updates local booking status to CONFIRMED
   - Shows success page

### Error Handling:

**Payment Failures:**
- Stripe returns specific error codes
- Payment status set to FAILED
- Booking status set to CANCELLED
- User sees retry option

**Validation:**
- Check booking exists
- Verify room availability
- Validate dates
- Confirm payment amount

## Client Integration

### Stripe.js Setup:

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await getStripe();
```

### Payment Element:

```typescript
import { Elements, PaymentElement } from '@stripe/react-stripe-js';

<Elements stripe={stripe} options={{ clientSecret }}>
  <PaymentElement />
  <button>Pay</button>
</Elements>
```

## Availability Logic

### Room Availability Check:

1. Get total units for room type
2. Count confirmed/checked-in bookings for date range
3. Calculate available units: total - booked
4. Return availability status

### Date Range Logic:

```typescript
// Check if date ranges overlap
booking.checkInDate < requestedCheckOut &&
booking.checkOutDate > requestedCheckIn
```

## Booking Number Generation

**Format:** `LXS-YYYY-XXXXX`
- `LXS`: Hotel prefix (customizable)
- `YYYY`: Current year
- `XXXXX`: 5 random uppercase alphanumeric characters

**Example:** `LXS-2024-A7K9P`

## Pricing Calculation

```
Total = (roomPrice × nights × quantity) + addOnsTotal - discountAmount
```

**Components:**
- Base price per night from RoomType
- Number of nights (checkout - checkin)
- Quantity of rooms
- Add-ons (breakfast, parking, etc.)
- Promo code discount percentage

## Error Responses

All API errors follow standard format:

```json
{
  "error": "Error message describing the issue"
}
```

### Common Errors:

- **400 Bad Request:** Missing required fields, invalid dates, unavailable rooms
- **404 Not Found:** Room or booking not found
- **500 Internal Server Error:** Database or Stripe API error

## Testing

### Test Card Numbers:
- Success: `4242 4242 4242 4242`
- Failure: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

### Test Mode:
- Use Stripe test keys (starts with `pk_test_` and `sk_test_`)
- Enable Stripe test mode in dashboard
- Use test card numbers above

### Mock Responses:
- Availability checking returns realistic data
- Booking creation returns valid booking numbers
- Payment intents use Stripe's test mode

## Performance Considerations

### Optimization:

1. **Query Optimization:**
   - Use indexed fields for queries
   - Count queries for availability
   - Minimize N+1 queries

2. **Caching:**
   - Cache room listings (5-minute TTL)
   - Cache availability for specific dates
   - Invalidate on new bookings

3. **Rate Limiting:**
   - Implement per-IP rate limiting
   - Prevent double-booking with database constraints
   - Lock database rows during confirmation

### Database Indexes:

Created indexes on:
- `rooms.id`, `room_types.id`
- `bookings.status`, `bookings.checkInDate`
- `payments.stripePaymentIntentId`
- `reservations.sessionId`, `reservations.expiresAt`

## Security

### API Security:

1. **Authentication (Phase 7):**
   - JWT tokens for authenticated users
   - Optional guest checkout
   - CORS protection

2. **Validation:**
   - Input sanitization
   - Email validation
   - Date range validation
   - Amount verification

3. **Stripe Security:**
   - Never expose secret key
   - Verify webhook signatures
   - Use client secrets for payments
   - PCI compliance with payment elements

4. **HTTPS:**
   - All endpoints use HTTPS
   - Secure cookies for sessions
   - CSP headers for XSS protection

## Integration with Frontend

### Booking Flow Integration:

1. **Phase 4 Frontend → Phase 5 API:**
   - GET `/api/v1/rooms` - Fetch room list
   - POST `/api/v1/rooms/:id/availability` - Check availability
   - POST `/api/v1/bookings` - Create booking with payment intent

2. **Payment Component:**
   - Add Stripe Elements to checkout page
   - Use clientSecret from booking creation
   - Confirm payment and redirect to confirmation page

## Deployment Checklist

- [ ] Stripe API keys configured
- [ ] Webhook URL registered in Stripe dashboard
- [ ] Database migrations executed
- [ ] Rate limiting configured
- [ ] Error monitoring set up
- [ ] Email service integrated
- [ ] CORS headers configured
- [ ] Test payments processed
- [ ] Webhook events verified

## Next Steps (Phase 6)

1. **Real-time Updates:**
   - WebSocket for availability changes
   - Live room inventory updates
   - Booking notifications

2. **Advanced Features:**
   - Promo code validation
   - Add-ons selection UI
   - Guest communication
   - Order tracking

## File Structure

```
app/api/v1/
├── rooms/
│   ├── route.ts                    # List all rooms
│   ├── [id]/
│   │   ├── route.ts                # Get room details
│   │   └── availability/
│   │       └── route.ts            # Check availability
├── bookings/
│   ├── route.ts                    # Create booking
│   └── confirm/
│       └── route.ts                # Confirm booking
├── payments/
│   └── create-payment-intent/
│       └── route.ts                # Create payment intent
└── webhooks/
    └── stripe/
        └── route.ts                # Stripe webhooks

lib/
├── stripe-client.ts                # Stripe utilities
```

---

**Status:** ✅ Phase 5 Complete
**Next Phase:** Phase 6 - WebSocket Real-time Updates
