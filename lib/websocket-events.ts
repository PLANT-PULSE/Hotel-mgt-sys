import { getWebSocketManager } from './websocket-server';

/**
 * Broadcast availability update to all connected clients
 */
export function broadcastAvailabilityUpdate(
  roomTypeId: string,
  availableUnits: number,
  totalUnits: number
) {
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.broadcastAvailabilityUpdate(roomTypeId, availableUnits, totalUnits);
  }
}

/**
 * Broadcast booking notification to all connected clients
 */
export function broadcastBookingNotification(
  type: 'booking-created' | 'booking-confirmed' | 'booking-cancelled',
  bookingNumber: string,
  roomTypeId: string,
  guestEmail: string
) {
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.broadcastBookingNotification(type, bookingNumber, roomTypeId, guestEmail);
  }
}

/**
 * Broadcast multiple room availability updates
 * Useful after bulk operations
 */
export async function broadcastMultipleAvailabilityUpdates(
  updates: Array<{
    roomTypeId: string;
    availableUnits: number;
    totalUnits: number;
  }>
) {
  updates.forEach(({ roomTypeId, availableUnits, totalUnits }) => {
    broadcastAvailabilityUpdate(roomTypeId, availableUnits, totalUnits);
  });
}

/**
 * Recalculate and broadcast availability for a room type
 */
export async function recalculateAndBroadcastAvailability(
  roomTypeId: string,
  prisma: any // PrismaClient type
) {
  try {
    const room = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: { totalUnits: true },
    });

    if (!room) return;

    // Count current bookings
    const bookedCount = await prisma.bookingItem.count({
      where: {
        roomTypeId,
        booking: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN'],
          },
        },
      },
    });

    const availableUnits = room.totalUnits - bookedCount;
    broadcastAvailabilityUpdate(roomTypeId, availableUnits, room.totalUnits);
  } catch (error) {
    console.error('Error recalculating availability:', error);
  }
}

/**
 * Broadcast inventory change alert to admins
 */
export function broadcastInventoryAlert(
  roomTypeId: string,
  message: string,
  severity: 'low' | 'medium' | 'high'
) {
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.broadcast(
      {
        type: 'inventory-alert',
        roomTypeId,
        message,
        severity,
        timestamp: new Date().toISOString(),
      } as any,
      `admin:inventory`
    );
  }
}

/**
 * Broadcast check-in/check-out reminders
 */
export function broadcastReminderNotification(
  type: 'check-in' | 'check-out',
  bookingNumber: string,
  guestEmail: string,
  roomNumber?: string
) {
  const wsManager = getWebSocketManager();
  if (wsManager) {
    wsManager.broadcast(
      {
        type: `${type}-reminder`,
        bookingNumber,
        guestEmail,
        roomNumber,
        timestamp: new Date().toISOString(),
      } as any,
      'notifications'
    );
  }
}
