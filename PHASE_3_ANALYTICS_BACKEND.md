# Phase 3: Admin Analytics & Booking Management Backend

## Overview
This phase enhances the backend dashboard service with comprehensive analytics calculations and new API endpoints to power the admin analytics pages built in Phase 2.

## Backend Enhancements

### 1. Enhanced Dashboard Service
**File:** `backend/src/dashboard/dashboard.service.ts`

#### New Methods Added:

**`getDashboardOverview()`**
- Aggregates all key metrics into a single comprehensive response
- Fetches stats, revenue, bookings, check-ins/outs, pending payments, and room performance
- Returns: Complete dashboard snapshot with all required data

**`getTodayCheckins()`**
- Counts bookings with check-in date today
- Excludes cancelled bookings
- Used for daily operations summary

**`getTodayCheckouts()`**
- Counts bookings with check-out date today
- Excludes cancelled bookings
- Tracks departing guests for housekeeping coordination

**`getPendingPayments()`**
- Returns count and total amount of pending payments
- Identifies payment collection opportunities
- Returns: `{ count: number, totalAmount: number }`

**`getRoomTypePerformance(months = 6)`**
- Calculates revenue and booking metrics by room type
- Analyzes performance over last 6 months by default
- Calculates average revenue per booking
- Returns: Array of room types with performance data

**`getGuestAnalytics()`**
- Provides guest-related metrics
- Calculates loyalty rate (returning guests)
- Tracks new guests this month
- Returns: Guest count, loyalty metrics, booking analysis

### 2. Updated Dashboard Controller
**File:** `backend/src/dashboard/dashboard.controller.ts`

#### New Endpoints:

**`GET /api/v1/dashboard/overview`**
```json
{
  "stats": { /* basic metrics */ },
  "revenueOverview": [ /* 6 months */ ],
  "recentBookings": [ /* recent 5 bookings */ ],
  "todayCheckins": 8,
  "todayCheckouts": 5,
  "pendingPayments": { "count": 3, "totalAmount": 1500 },
  "roomTypePerformance": [ /* performance by room */ ],
  "timestamp": "ISO date"
}
```

**`GET /api/v1/dashboard/room-performance?months=6`**
```json
[
  {
    "id": "room-id",
    "name": "Luxury Suite",
    "type": "suite",
    "basePrice": 450,
    "totalBookings": 25,
    "totalRevenue": 11250,
    "avgRevenuePerBooking": 450
  },
  /* more room types */
]
```

**`GET /api/v1/dashboard/guest-analytics`**
```json
{
  "totalGuests": 156,
  "newGuestsThisMonth": 18,
  "returningGuests": 42,
  "totalBookingsByGuests": 245,
  "loyaltyRate": 26.92
}
```

**`GET /api/v1/dashboard/daily-summary`**
```json
{
  "checkins": 8,
  "checkouts": 5,
  "pendingPayments": {
    "count": 3,
    "totalAmount": 1500
  }
}
```

## Analytics Calculations

### Occupancy Rate Calculation
```
occupancy_rate = (occupied_rooms / total_rooms) * 100
```
- Updated in real-time as bookings are created
- Helps track hotel utilization
- Used for performance benchmarking

### Revenue Analysis
```
monthly_revenue = SUM(completed_payments) for the month
avg_revenue_per_night = total_revenue / total_nights_booked
```
- Tracks financial performance
- Identifies seasonal trends
- Shows revenue per room type

### Loyalty Metrics
```
loyalty_rate = (returning_guests / total_guests) * 100
returning_guests = guests with bookings before current month
```
- Measures guest retention
- Helps identify brand loyalty
- Supports targeted marketing

### Room Performance
```
room_revenue = SUM(booking_amounts) for that room type
room_bookings = COUNT(bookings) for that room type
avg_revenue_per_booking = room_revenue / room_bookings
```
- Compare which room types are most profitable
- Identify pricing optimization opportunities
- Track demand by room type

## Integration Points

### Frontend API Integration (Phase 5)
The following frontend components will connect to these endpoints:

**Dashboard Page (`app/admin/page.tsx`)**
- Fetch `/api/v1/dashboard/overview` on component mount
- Update stats cards with real data
- Display recent bookings from API
- Show pending payment count

**Analytics Page (`app/admin/analytics/page.tsx`)**
- Fetch `/api/v1/dashboard/room-performance?months=6`
- Fetch `/api/v1/dashboard/guest-analytics`
- Populate revenue trend chart
- Display room performance table
- Show guest metrics

**Daily Operations (`app/admin/page.tsx`)**
- Fetch `/api/v1/dashboard/daily-summary` every 5 minutes
- Update check-in/checkout counts
- Alert on pending payments

### WebSocket Integration (Phase 6)
Real-time updates will be pushed via WebSocket when:
- New booking created → dashboard updates
- Payment completed → pending payments decrease
- Room status changes → occupancy rate updates

## Data Aggregation Strategies

### Efficient Queries
- Uses Prisma aggregate functions to minimize database calls
- Parallel queries with `Promise.all()` for better performance
- Indexes on payment status and booking dates for fast filtering

### Caching Opportunities (Phase 5)
- Cache 6-month revenue history (daily invalidation)
- Cache room performance (hourly invalidation)
- Cache guest analytics (daily invalidation)
- Cache daily summary (10-minute invalidation)

## Database Considerations

### Performance Indexes
Ensure these indexes exist in Prisma schema for optimal query performance:
- `payments(status, paidAt)` - for revenue queries
- `bookings(checkInDate, checkOutDate, status)` - for occupancy
- `bookings(createdAt, status)` - for trend analysis
- `guests(createdAt)` - for new guest tracking

### Query Optimization
- Avoid N+1 queries with proper include/select
- Use groupBy for aggregations instead of fetching all data
- Filter at database level, not in application

## Testing Scenarios

### Revenue Calculation
- [ ] Create bookings with various payment statuses
- [ ] Verify only COMPLETED payments are counted
- [ ] Test date range filtering (current month only)
- [ ] Verify currency handling

### Occupancy Rate
- [ ] Verify calculation with different room counts
- [ ] Test with AVAILABLE vs OCCUPIED vs CLEANING
- [ ] Edge case: 0 total rooms

### Guest Analytics
- [ ] Create new guests and existing guests
- [ ] Verify loyalty rate calculation
- [ ] Test with no guests
- [ ] Test with all new or all returning guests

### Daily Summary
- [ ] Create bookings with today's check-in date
- [ ] Create bookings with today's check-out date
- [ ] Verify cancelled bookings are excluded
- [ ] Test timezone handling

## Monitoring & Logging

### Key Metrics to Monitor
- Dashboard query response time (should be < 500ms)
- Revenue calculation accuracy
- Occupancy rate updates frequency
- Analytics API hit rate

### Logging Points
- Each dashboard query execution time
- Error handling for missing data
- Guest analytics edge cases
- Payment aggregation results

## Error Handling

### Graceful Degradation
- Return 0 for missing aggregated values
- Don't fail entire overview if one metric errors
- Log errors for debugging without breaking API

### Edge Cases Handled
- No bookings in date range
- No completed payments
- Division by zero in percentage calculations
- Missing guest data

## Next Steps

→ **Phase 4:** Build customer-facing booking flow and room browsing
→ **Phase 5:** Implement complete API integration and real-time updates
→ **Phase 6:** Add WebSocket real-time analytics updates

## Migration Notes

When deploying Phase 3:
1. No database schema changes required
2. Deploy new controller endpoints first
3. Update frontend dependencies if needed
4. Test all analytics calculations with production data
5. Monitor query performance in production

## Performance Benchmarks

Target performance metrics:
- `GET /dashboard/overview`: < 500ms
- `GET /dashboard/room-performance`: < 300ms
- `GET /dashboard/guest-analytics`: < 200ms
- `GET /dashboard/daily-summary`: < 100ms

All endpoints should support:
- Concurrent requests
- High traffic (100+ requests/min)
- Long-term usage (no memory leaks)
