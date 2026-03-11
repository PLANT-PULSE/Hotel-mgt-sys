# Phase 6: WebSocket Real-time Updates - Complete Implementation

## Overview
Phase 6 implements real-time updates via WebSocket for inventory management, booking notifications, and live availability changes across all connected clients.

## Architecture

### Server-Side Components

#### WebSocket Server (lib/websocket-server.ts)
Manages WebSocket connections and broadcasts messages to connected clients.

**Features:**
- Connection management with automatic disconnect handling
- Channel-based subscriptions for selective broadcasting
- Heartbeat mechanism (30-second ping) to detect stale connections
- Message routing and type safety

**Key Methods:**
- `initialize()` - Set up WebSocket server
- `subscribe(ws, channel)` - Subscribe client to channel
- `broadcast(message, channel?)` - Send message to subscribers
- `broadcastAvailabilityUpdate()` - Update room availability
- `broadcastBookingNotification()` - Notify about booking events

#### Event Broadcaster (lib/websocket-events.ts)
Helper functions to broadcast events from API endpoints.

**Available Functions:**
- `broadcastAvailabilityUpdate()` - Room availability update
- `broadcastBookingNotification()` - Booking lifecycle events
- `broadcastMultipleAvailabilityUpdates()` - Bulk updates
- `recalculateAndBroadcastAvailability()` - Recalculate and broadcast
- `broadcastInventoryAlert()` - Admin alerts
- `broadcastReminderNotification()` - Check-in/out reminders

### Client-Side Components

#### useWebSocket Hook (hooks/useWebSocket.ts)
React hook for WebSocket communication.

**State:**
- `isConnected` - Connection status
- `availability` - Map of room availability
- `bookingNotifications` - Recent booking notifications

**Methods:**
- `subscribe(channel)` - Subscribe to channel
- `unsubscribe(channel)` - Unsubscribe from channel
- `getAvailability()` - Request current availability
- `ping()` - Send ping message

**Usage:**
```typescript
const { isConnected, availability, subscribe } = useWebSocket();

useEffect(() => {
  subscribe('room:room-123');
}, []);
```

#### RealTimeAvailability Component (components/RealTimeAvailability.tsx)
Displays real-time room availability.

**Props:**
- `roomTypeId` - Room type identifier
- `roomName` - Display name
- `checkInDate` - Optional check-in date
- `checkOutDate` - Optional check-out date

**Features:**
- Live availability percentage
- Connection status indicator
- Auto-subscribe to room channel
- Visual availability bar

**Example:**
```tsx
<RealTimeAvailability
  roomTypeId="room-123"
  roomName="Luxury Suite"
  checkInDate="2024-12-20"
  checkOutDate="2024-12-25"
/>
```

#### BookingNotifications Component (components/BookingNotifications.tsx)
Toast-style notification system for booking events.

**Features:**
- Auto-hide after 5 seconds
- Stack up to 5 notifications
- Color-coded by event type
- Manual dismiss option

**Event Types:**
- `booking-created` - Blue (informational)
- `booking-confirmed` - Green (success)
- `booking-cancelled` - Red (error)

**Usage:**
```tsx
<BookingNotifications />
```

## WebSocket Protocol

### Message Types

#### Client Messages

##### Subscribe
```json
{
  "type": "subscribe",
  "channel": "room:room-123"
}
```

##### Unsubscribe
```json
{
  "type": "unsubscribe",
  "channel": "room:room-123"
}
```

##### Get Availability
```json
{
  "type": "get-availability",
  "roomTypeId": "room-123",
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-25"
}
```

##### Ping
```json
{
  "type": "ping"
}
```

#### Server Messages

##### Availability Update
```json
{
  "type": "availability-update",
  "roomTypeId": "room-123",
  "availableUnits": 2,
  "totalUnits": 5,
  "timestamp": "2024-12-15T10:30:00Z"
}
```

##### Booking Notification
```json
{
  "type": "booking-created|booking-confirmed|booking-cancelled",
  "bookingNumber": "LXS-2024-ABC12",
  "roomTypeId": "room-123",
  "guestEmail": "guest@example.com",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

##### Pong
```json
{
  "type": "pong",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

## Channel Structure

### Room Availability Channels
- Format: `room:ROOM_TYPE_ID`
- Example: `room:room-123`
- Purpose: Availability updates for specific room types
- Subscribers: Booking pages, room browsing pages

### Admin Channels
- `admin:inventory` - Inventory alerts
- `admin:operations` - Operational notifications
- Subscribers: Admin dashboard, staff

### General Channels
- `notifications` - Global notifications
- `reminders` - Check-in/out reminders
- Subscribers: All connected clients (optional)

## Integration Points

### API Integration

**Booking Creation** (`/api/v1/bookings`):
```typescript
broadcastBookingNotification(
  'booking-created',
  booking.bookingNumber,
  roomTypeId,
  guestEmail
);
```

**Booking Confirmation** (`/api/v1/bookings/confirm`):
```typescript
roomTypeIds.forEach((roomTypeId) => {
  broadcastBookingNotification(
    'booking-confirmed',
    booking.bookingNumber,
    roomTypeId,
    booking.guestEmail
  );
  recalculateAndBroadcastAvailability(roomTypeId, prisma);
});
```

### Frontend Integration

**Room Browsing Page**:
```tsx
<RealTimeAvailability
  roomTypeId={room.id}
  roomName={room.name}
  checkInDate={checkInDate}
  checkOutDate={checkOutDate}
/>
```

**Booking Page**:
```tsx
const { availability } = useWebSocket();
const availableUnits = availability.get(roomTypeId);
```

**Layout Component**:
```tsx
<BookingNotifications />
```

## Performance Optimization

### Message Filtering
- Only broadcast to relevant subscribers
- Use channels to reduce broadcast scope
- Avoid broadcasting to closed connections

### Heartbeat Management
- 30-second ping interval
- Auto-terminate stale connections
- Reduces memory leaks from disconnected clients

### Message Queuing
- Future enhancement: Queue messages for offline clients
- Retry mechanisms for failed broadcasts
- Message compression for large payloads

### Connection Pooling
- Reuse WebSocket connections across components
- Single connection per browser instance
- Shared state via React Context/Hook

## Scalability Considerations

### Current Implementation
- Single-server WebSocket (suitable for MVP)
- All clients connected to same server
- In-memory subscription tracking

### Future Scaling (Phase 7+)
- Redis pub/sub for multi-server deployments
- Message broker for event distribution
- Separate WebSocket server from API
- Client affinity with load balancing

## Error Handling

### Connection Errors
- Auto-reconnect with exponential backoff
- Graceful degradation if WebSocket unavailable
- Fall back to polling for availability

### Message Parsing Errors
- Try/catch around JSON parsing
- Log errors for debugging
- Don't break connection on parse error

### Server Errors
- Validate message format
- Verify channel permissions
- Return error responses

## Security Considerations

### Authentication (Phase 7)
- Verify user permissions before subscribing
- Restrict admin channels to staff
- Rate limiting per connection

### Data Privacy
- Don't broadcast sensitive information
- Mask guest emails in public channels
- Use private channels for personal data

### Rate Limiting
- Limit message frequency per client
- Prevent message flooding
- Monitor for abuse patterns

## Testing

### Manual Testing
1. Open two browser windows
2. Create booking in one window
3. Verify notification appears in other window
4. Check availability updates in real-time

### Integration Testing
```typescript
// Test WebSocket connection
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('Connected');

// Test subscription
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'room:room-123'
}));

// Simulate booking
fetch('/api/v1/bookings', { method: 'POST', ... });

// Verify message received
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### Load Testing
- Test with 100+ concurrent connections
- Verify message delivery under load
- Monitor memory usage
- Check for connection leaks

## Deployment

### Environment Setup
- Ensure WebSocket upgrades allowed
- Configure CORS for WebSocket
- Set up proper SSL certificates
- Enable WSS (WebSocket Secure)

### Vercel Deployment
- WebSocket support on Edge Network
- Use serverless functions for API
- Connect to database
- Monitor WebSocket connections

### Monitoring
- Track active connections
- Monitor message latency
- Log connection/disconnection events
- Alert on unusual patterns

## Implementation Checklist

**Server Setup:**
- [ ] WebSocket server initialized
- [ ] Channel-based routing working
- [ ] Heartbeat mechanism active
- [ ] Broadcast functions implemented

**Frontend Components:**
- [ ] useWebSocket hook working
- [ ] RealTimeAvailability component rendering
- [ ] BookingNotifications displaying
- [ ] Connection status indicator visible

**API Integration:**
- [ ] Booking endpoints emit events
- [ ] Confirmation endpoint broadcasts
- [ ] Availability recalculation working
- [ ] Event data correct

**Testing:**
- [ ] Manual testing passed
- [ ] Multiple clients sync correctly
- [ ] Notifications display accurately
- [ ] No memory leaks

**Deployment:**
- [ ] WebSocket enabled in production
- [ ] SSL/TLS configured
- [ ] Monitoring active
- [ ] Error tracking set up

## File Structure

```
lib/
├── websocket-server.ts         # Server implementation
├── websocket-events.ts         # Event broadcaster

hooks/
├── useWebSocket.ts             # React hook

components/
├── RealTimeAvailability.tsx    # Availability display
├── BookingNotifications.tsx    # Notification toast

app/api/v1/
├── bookings/route.ts           # Updated with broadcasts
├── bookings/confirm/route.ts   # Updated with broadcasts
```

## Next Steps (Phase 7)

1. **Testing & Validation:**
   - Unit tests for WebSocket functions
   - Integration tests for event flow
   - E2E tests for user interactions
   - Load testing

2. **Enhancements:**
   - Admin dashboard WebSocket integration
   - Real-time reporting
   - Chat/messaging system
   - Push notifications

3. **Scalability:**
   - Redis pub/sub for multi-server
   - Separate WebSocket tier
   - Connection optimization
   - Message compression

---

**Status:** ✅ Phase 6 Complete
**Next Phase:** Phase 7 - Testing & Validation
