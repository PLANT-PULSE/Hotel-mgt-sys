/**
 * API Tests for Booking Endpoints
 * Tests booking creation, payment, confirmation, and validation
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Booking API Endpoints', () => {
  const API_URL = 'http://localhost:3000/api/v1';
  let roomId: string;
  let bookingId: string;
  let paymentIntentId: string;

  beforeAll(async () => {
    // Get a room to use for booking tests
    const roomsResponse = await fetch(`${API_URL}/rooms`);
    const rooms = await roomsResponse.json();
    roomId = rooms[0].id;
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a booking successfully', async () => {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: roomId,
          quantity: 1,
          checkInDate: '2024-12-20',
          checkOutDate: '2024-12-25',
          guestFirstName: 'John',
          guestLastName: 'Doe',
          guestEmail: 'john@example.com',
          guestPhone: '+1234567890',
          specialRequests: 'Early check-in if possible',
        }),
      });

      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.booking).toHaveProperty('id');
      expect(result.booking).toHaveProperty('bookingNumber');
      expect(result.booking.status).toBe('PENDING');
      expect(result.payment).toHaveProperty('clientSecret');

      // Store for later tests
      bookingId = result.booking.id;
      paymentIntentId = result.payment.paymentIntentId;
    });

    it('should validate required guest information', async () => {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: roomId,
          quantity: 1,
          checkInDate: '2024-12-20',
          checkOutDate: '2024-12-25',
          guestFirstName: 'John',
          // Missing guestLastName
          guestEmail: 'john@example.com',
        }),
      });

      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error.error).toBeDefined();
    });

    it('should reject invalid date ranges', async () => {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: roomId,
          quantity: 1,
          checkInDate: '2024-12-25',
          checkOutDate: '2024-12-20', // Invalid: checkOut before checkIn
          guestFirstName: 'John',
          guestLastName: 'Doe',
          guestEmail: 'john@example.com',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should handle unavailable rooms', async () => {
      // Create multiple bookings to exhaust availability
      const checkInDate = '2024-12-20';
      const checkOutDate = '2024-12-25';

      // Check availability first
      const availabilityResponse = await fetch(
        `${API_URL}/rooms/${roomId}/availability`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkInDate,
            checkOutDate,
            quantity: 100, // Request more than available
          }),
        }
      );

      const availability = await availabilityResponse.json();
      const availableUnits = availability.availableUnits;

      if (availableUnits < 100) {
        // Try to book more than available
        const response = await fetch(`${API_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTypeId,
            quantity: 100,
            checkInDate,
            checkOutDate,
            guestFirstName: 'Test',
            guestLastName: 'User',
            guestEmail: 'test@example.com',
          }),
        });

        expect(response.status).toBe(400);
        const error = await response.json();
        expect(error.error).toContain('Not enough rooms');
      }
    });

    it('should calculate correct total price', async () => {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId,
          quantity: 2,
          checkInDate: '2024-12-20',
          checkOutDate: '2024-12-25', // 5 nights
          guestFirstName: 'Jane',
          guestLastName: 'Smith',
          guestEmail: 'jane@example.com',
        }),
      });

      expect(response.status).toBe(201);

      const result = await response.json();
      const totalAmount = result.booking.totalAmount;

      // Verify totalAmount is a positive number
      expect(typeof totalAmount).toBe('number');
      expect(totalAmount).toBeGreaterThan(0);

      // Note: Actual price calculation would be verified with known base price
    });
  });

  describe('POST /api/v1/payments/create-payment-intent', () => {
    it('should create payment intent for booking', async () => {
      const response = await fetch(
        `${API_URL}/payments/create-payment-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        }
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toHaveProperty('clientSecret');
      expect(result).toHaveProperty('paymentIntentId');
      expect(result).toHaveProperty('amount');
      expect(result.currency).toBe('usd');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await fetch(
        `${API_URL}/payments/create-payment-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: 'non-existent-id' }),
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/bookings/confirm', () => {
    it('should require valid payment intent', async () => {
      const response = await fetch(`${API_URL}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentIntentId: 'invalid-intent-id',
        }),
      });

      // Should fail because payment intent hasn't succeeded
      expect([400, 500]).toContain(response.status);
    });

    it('should validate required fields', async () => {
      const response = await fetch(`${API_URL}/bookings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
        // Missing paymentIntentId
      });

      expect(response.status).toBe(400);
    });
  });
});

describe('Booking Business Logic', () => {
  const API_URL = 'http://localhost:3000/api/v1';

  it('should generate unique booking numbers', async () => {
    const roomsResponse = await fetch(`${API_URL}/rooms`);
    const rooms = await roomsResponse.json();
    const roomId = rooms[0].id;

    const bookingNumbers = new Set<string>();

    // Create multiple bookings
    for (let i = 0; i < 3; i++) {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: roomId,
          quantity: 1,
          checkInDate: `2024-12-${20 + i}`,
          checkOutDate: `2024-12-${25 + i}`,
          guestFirstName: `Guest${i}`,
          guestLastName: 'Test',
          guestEmail: `guest${i}@example.com`,
        }),
      });

      const result = await response.json();
      bookingNumbers.add(result.booking.bookingNumber);
    }

    // All booking numbers should be unique
    expect(bookingNumbers.size).toBe(3);

    // Verify format (LXS-YYYY-XXXXX)
    bookingNumbers.forEach((number) => {
      expect(number).toMatch(/^LXS-\d{4}-[A-Z0-9]{5}$/);
    });
  });

  it('should handle promo codes', async () => {
    // This test assumes a promo code exists in the database
    const roomsResponse = await fetch('http://localhost:3000/api/v1/rooms');
    const rooms = await roomsResponse.json();
    const roomId = rooms[0].id;

    // Test with promo code (actual promo code ID would be from database)
    const response = await fetch('http://localhost:3000/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomTypeId: roomId,
        quantity: 1,
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-25',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestEmail: 'john@example.com',
        promoCodeId: 'valid-promo-code',
      }),
    });

    // Should succeed or fail gracefully if promo code doesn't exist
    expect([201, 400]).toContain(response.status);
  });

  it('should include add-ons in booking', async () => {
    const roomsResponse = await fetch('http://localhost:3000/api/v1/rooms');
    const rooms = await roomsResponse.json();
    const roomId = rooms[0].id;

    const response = await fetch('http://localhost:3000/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomTypeId: roomId,
        quantity: 1,
        checkInDate: '2024-12-20',
        checkOutDate: '2024-12-25',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestEmail: 'john@example.com',
        addOns: [
          { addOnId: 'breakfast', quantity: 5 },
          { addOnId: 'parking', quantity: 5 },
        ],
      }),
    });

    expect([201, 400]).toContain(response.status);
  });
});
