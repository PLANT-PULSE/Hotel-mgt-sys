# Frontend API Integration Guide

To connect your Next.js frontend to this backend:

## 1. Environment Variable

Add to `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## 2. API Client Example

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data.data ?? data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI<{ user; tokens }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  rooms: () => fetchAPI('/rooms'),
  room: (id: string) => fetchAPI(`/rooms/${id}`),
  addOns: () => fetchAPI('/add-ons'),
  promoValidate: (code: string) => fetchAPI('/promo-codes/validate', { method: 'POST', body: JSON.stringify({ code }) }),
  createBooking: (data) => fetchAPI('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  lookupBooking: (number: string) => fetchAPI(`/bookings/lookup/${number}`),
};
```

## 3. Room Data Mapping

Backend room types map to your frontend structure:

| Frontend (main.js) | Backend API |
|--------------------|-------------|
| `id`               | `id` (UUID) |
| `name`             | `name`      |
| `type`             | `type`      |
| `price`            | `basePrice` |
| `amenities`        | `amenities` |
| `beds`             | `beds`      |
| `guests`           | `maxGuests` |
| `size`             | `size`      |
| `image`            | `image`     |
| `roomsLeft`        | `roomsLeft` (computed) |

## 4. Create Booking Payload

```json
{
  "checkInDate": "2024-12-15",
  "checkOutDate": "2024-12-18",
  "guestFirstName": "John",
  "guestLastName": "Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "items": [
    { "roomTypeId": "<uuid-from-rooms-api>", "quantity": 1, "pricePerNight": 299 }
  ],
  "addOns": [
    { "addOnId": "<uuid-from-addons-api>", "quantity": 1 }
  ],
  "promoCode": "SAVE10"
}
```
