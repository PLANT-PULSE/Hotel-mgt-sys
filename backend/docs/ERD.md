# Database ERD - Hotel Management System

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│    User     │────<│  RefreshToken   │     │    Guest     │
├─────────────┤     └─────────────────┘     ├──────────────┤
│ id (PK)     │     ┌─────────────────┐     │ id (PK)      │
│ email       │────<│     Staff       │     │ userId (FK)  │───┐
│ passwordHash│     └─────────────────┘     │ loyaltyPoints│   │
│ role        │                             └──────┬───────┘   │
└──────┬──────┘                                    │          │
       │                                           │          │
       │     ┌─────────────┐     ┌──────────────┐  │          │
       └────>│   Booking   │<────│ BookingItem  │  │          │
             ├─────────────┤     ├──────────────┤  │          │
             │ id (PK)     │     │ roomTypeId   │──┼──────────┼──┐
             │ guestId(FK) │     │ quantity     │  │          │  │
             │ bookingNumber│    └──────────────┘  │          │  │
             │ checkInDate  │     ┌──────────────┐ │          │  │
             │ checkOutDate │     │ BookingAddOn │ │          │  │
             │ totalAmount  │     └──────────────┘ │          │  │
             └──────┬───────┘                      │          │  │
                    │                             │          │  │
                    ├──────────┬──────────────────┘          │  │
                    │          │                             │  │
                    v          v                             │  │
             ┌──────────┐ ┌─────────────┐                    │  │
             │ Payment  │ │Notification │                    │  │
             └──────────┘ └─────────────┘                    │  │
                                                             │  │
┌─────────────┐     ┌─────────────┐     ┌───────────────────┘  │
│  RoomType   │     │    Room     │     │                       │
├─────────────┤     ├─────────────┤     │  ┌─────────────┐      │
│ id (PK)     │<────│ roomTypeId  │     │  │   AddOn     │      │
│ name        │     │ number      │     └─>│   PromoCode │      │
│ basePrice   │     │ status      │        └─────────────┘      │
│ amenities[] │     └─────────────┘                             │
└─────────────┘                                                  │
                                                                 │
┌─────────────┐                                                  │
│  AuditLog   │<─────────────────────────────────────────────────┘
└─────────────┘
```

## Key Relationships

| Parent | Child | Relationship |
|--------|-------|--------------|
| User | RefreshToken | 1:N |
| User | Guest | 1:1 |
| User | Staff | 1:1 |
| User | Booking (createdBy) | 1:N |
| Guest | Booking | 1:N |
| RoomType | Room | 1:N |
| RoomType | BookingItem | 1:N |
| Booking | BookingItem | 1:N |
| Booking | BookingAddOn | 1:N |
| Booking | Payment | 1:N |
| Booking | Notification | 1:N |
| AddOn | BookingAddOn | 1:N |

## Indexes

- `users.email` (unique)
- `users.role`
- `refresh_tokens.token`, `refresh_tokens.userId`
- `bookings.bookingNumber` (unique)
- `bookings.guestId`, `bookings.status`
- `payments.bookingId`, `payments.transactionId`
- `rooms.number` (unique), `rooms.status`
- `audit_logs.userId`, `audit_logs.entity`
