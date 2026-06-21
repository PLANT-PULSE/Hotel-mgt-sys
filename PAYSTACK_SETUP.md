# Paystack Payment Integration Guide

## Setup Instructions

### 1. Get Paystack API Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.co)
2. Sign up or log in to your account
3. Go to **Settings** → **API Keys & Webhooks**
4. Copy your **Public Key** (starts with `pk_`) and **Secret Key** (starts with `sk_`)

### 2. Add Environment Variables

Create a `.env.local` file in the root of your project and add:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Using the Payment Component

```tsx
import PaystackPayment from '@/components/paystack-payment';
import { useState } from 'react';

export default function CheckoutPage() {
  const [paymentStatus, setPaymentStatus] = useState('');

  return (
    <div>
      <PaystackPayment
        email="guest@example.com"
        amount={50000} // Amount in Naira (or your currency)
        bookingId="booking-123"
        guestName="John Doe"
        onSuccess={(reference, data) => {
          setPaymentStatus(`Payment successful! Reference: ${reference}`);
          console.log('Payment verified:', data);
        }}
        onError={(error) => {
          setPaymentStatus(`Payment failed: ${error}`);
        }}
      />
      {paymentStatus && <p>{paymentStatus}</p>}
    </div>
  );
}
```

### 4. API Endpoints

#### Initialize Payment
**POST** `/api/payments/initialize`

Request body:
```json
{
  "email": "guest@example.com",
  "amount": 50000,
  "bookingId": "booking-123",
  "guestName": "John Doe",
  "hotelName": "LuxStay Hotel" // optional
}
```

Response:
```json
{
  "success": true,
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "...",
  "reference": "...",
  "amount": 50000,
  "email": "guest@example.com",
  "bookingId": "booking-123"
}
```

#### Verify Payment
**POST** `/api/payments/verify`

Request body:
```json
{
  "reference": "payment-reference-from-paystack"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "reference": "...",
  "amount": 50000,
  "bookingId": "booking-123",
  "guestName": "John Doe",
  "customerEmail": "guest@example.com",
  "paidAt": "2024-01-15T10:30:00Z"
}
```

### 5. Database Integration

After successful payment verification, you should update your booking record:

```typescript
// Example in your backend
await updateBooking(bookingId, {
  paymentStatus: 'paid',
  paymentReference: reference,
  paymentAmount: amount,
  paidAt: new Date(),
});
```

### 6. Webhooks (Optional but Recommended)

Set up Paystack webhooks for better payment handling:

1. Go to **Settings** → **API Keys & Webhooks** in Paystack Dashboard
2. Set webhook URL to: `https://yourdomain.com/api/payments/webhook`
3. Select event: `charge.success`

### 7. Testing

**Test credentials (Paystack Test Mode):**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `123456`

### 8. Production Checklist

- [ ] Update environment variables with live API keys
- [ ] Test payment flow end-to-end
- [ ] Set up database to track payments
- [ ] Configure email notifications for successful payments
- [ ] Set up Paystack webhooks
- [ ] Add error handling and logging
- [ ] Test refund process (if applicable)
- [ ] Update terms and conditions regarding payments

### 9. Troubleshooting

**Payment window doesn't open:**
- Verify Paystack script is loaded
- Check public key is correct
- Ensure domain is whitelisted in Paystack settings

**Payment verification fails:**
- Check secret key is correct
- Verify reference ID is valid
- Check Paystack API status

**CORS errors:**
- Payment initialization should happen from backend
- API calls should use relative URLs

### 10. Security Best Practices

1. Never expose secret key in client-side code
2. Always verify payments on the backend
3. Use HTTPS in production
4. Validate amount on backend before processing
5. Implement rate limiting on payment endpoints
6. Log all payment transactions
7. Monitor for suspicious activities

---

**Need help?** Check [Paystack Documentation](https://paystack.com/docs/api) or contact support.
