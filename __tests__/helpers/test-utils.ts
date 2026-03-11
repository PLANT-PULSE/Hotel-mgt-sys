/**
 * Test Utilities and Helpers
 * Provides common functions for testing
 */

export interface TestBooking {
  roomTypeId: string;
  quantity: number;
  checkInDate: string;
  checkOutDate: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
}

export interface TestRoom {
  id: string;
  name: string;
  basePrice: number;
  totalUnits: number;
}

/**
 * Generate test booking data
 */
export function createTestBooking(overrides?: Partial<TestBooking>): TestBooking {
  const defaultData: TestBooking = {
    roomTypeId: 'room-123',
    quantity: 1,
    checkInDate: '2024-12-20',
    checkOutDate: '2024-12-25',
    guestFirstName: 'Test',
    guestLastName: 'Guest',
    guestEmail: 'test@example.com',
    guestPhone: '+1234567890',
  };

  return { ...defaultData, ...overrides };
}

/**
 * Generate test date range
 */
export function generateDateRange(
  startDaysFromNow: number = 7,
  nights: number = 5
) {
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + startDaysFromNow);

  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + nights);

  return {
    checkInDate: checkInDate.toISOString().split('T')[0],
    checkOutDate: checkOutDate.toISOString().split('T')[0],
    nights,
  };
}

/**
 * Format price for API calls
 */
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

/**
 * Calculate expected total price
 */
export function calculateExpectedPrice(
  basePrice: number,
  nights: number,
  quantity: number,
  discountPercent: number = 0
): number {
  const subtotal = basePrice * nights * quantity;
  const discount = subtotal * (discountPercent / 100);
  return subtotal - discount;
}

/**
 * Validate booking number format
 */
export function isValidBookingNumber(bookingNumber: string): boolean {
  const pattern = /^LXS-\d{4}-[A-Z0-9]{5}$/;
  return pattern.test(bookingNumber);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Validate phone format (basic)
 */
export function isValidPhone(phone: string): boolean {
  const pattern = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return pattern.test(phone);
}

/**
 * Simulate API delay
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock response
 */
export function createMockResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Test data factories
 */
export const testDataFactories = {
  /**
   * Create multiple test bookings
   */
  createBookings(count: number, overrides?: Partial<TestBooking>): TestBooking[] {
    return Array.from({ length: count }, (_, i) => ({
      ...createTestBooking(overrides),
      guestEmail: `guest${i}@example.com`,
      guestFirstName: `Guest${i}`,
    }));
  },

  /**
   * Create booking with specific dates
   */
  createBookingForDates(startDate: string, endDate: string): TestBooking {
    return createTestBooking({
      checkInDate: startDate,
      checkOutDate: endDate,
    });
  },

  /**
   * Create multiple bookings for different date ranges
   */
  createBookingsForDateRanges(
    dateRanges: Array<{ start: string; end: string }>
  ): TestBooking[] {
    return dateRanges.map((range) =>
      this.createBookingForDates(range.start, range.end)
    );
  },
};

/**
 * Assertions helpers
 */
export const assertions = {
  /**
   * Assert booking structure
   */
  assertBookingStructure(booking: any): void {
    expect(booking).toHaveProperty('id');
    expect(booking).toHaveProperty('bookingNumber');
    expect(booking).toHaveProperty('checkInDate');
    expect(booking).toHaveProperty('checkOutDate');
    expect(booking).toHaveProperty('totalAmount');
    expect(booking).toHaveProperty('guestEmail');
    expect(booking).toHaveProperty('status');
    expect(isValidBookingNumber(booking.bookingNumber)).toBe(true);
  },

  /**
   * Assert payment structure
   */
  assertPaymentStructure(payment: any): void {
    expect(payment).toHaveProperty('id');
    expect(payment).toHaveProperty('clientSecret');
    expect(payment).toHaveProperty('amount');
    expect(payment).toHaveProperty('currency');
    expect(payment.currency).toBe('USD');
  },

  /**
   * Assert room structure
   */
  assertRoomStructure(room: any): void {
    expect(room).toHaveProperty('id');
    expect(room).toHaveProperty('name');
    expect(room).toHaveProperty('basePrice');
    expect(room).toHaveProperty('maxGuests');
    expect(room).toHaveProperty('beds');
    expect(room).toHaveProperty('amenities');
    expect(typeof room.basePrice).toBe('number');
    expect(room.basePrice).toBeGreaterThan(0);
  },

  /**
   * Assert availability structure
   */
  assertAvailabilityStructure(availability: any): void {
    expect(availability).toHaveProperty('roomTypeId');
    expect(availability).toHaveProperty('availableUnits');
    expect(availability).toHaveProperty('totalUnits');
    expect(availability).toHaveProperty('isAvailable');
    expect(typeof availability.isAvailable).toBe('boolean');
    expect(typeof availability.availableUnits).toBe('number');
  },
};

/**
 * Performance test helpers
 */
export const performance = {
  /**
   * Measure API response time
   */
  async measureResponseTime(
    url: string,
    options?: RequestInit
  ): Promise<{ duration: number; response: Response }> {
    const start = performance.now();
    const response = await fetch(url, options);
    const duration = performance.now() - start;
    return { duration, response };
  },

  /**
   * Assert response time is within acceptable range
   */
  assertResponseTimeAcceptable(duration: number, maxMs: number = 1000): void {
    expect(duration).toBeLessThan(maxMs);
  },

  /**
   * Run test multiple times and measure average
   */
  async measureAverageTime(
    fn: () => Promise<any>,
    iterations: number = 10
  ): Promise<number> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const duration = performance.now() - start;
      times.push(duration);
    }

    return times.reduce((a, b) => a + b, 0) / times.length;
  },
};

/**
 * Test data cleanup
 */
export async function cleanupTestData(
  bookingIds: string[],
  apiUrl: string = 'http://localhost:3000/api/v1'
): Promise<void> {
  // In a real scenario, implement cleanup API endpoints
  console.log(`Cleaning up ${bookingIds.length} test bookings`);
  // await fetch(`${apiUrl}/test/cleanup`, { method: 'POST', body: JSON.stringify({ bookingIds }) });
}
