/**
 * API Tests for Room Endpoints
 * Tests room fetching, availability checking, and filtering
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock environment
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/hotel_test';

describe('Room API Endpoints', () => {
  const API_URL = 'http://localhost:3000/api/v1';

  describe('GET /api/v1/rooms', () => {
    it('should fetch all rooms', async () => {
      const response = await fetch(`${API_URL}/rooms`);
      expect(response.status).toBe(200);

      const rooms = await response.json();
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBeGreaterThan(0);

      // Verify room structure
      const room = rooms[0];
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('basePrice');
      expect(room).toHaveProperty('available');
      expect(room).toHaveProperty('availableUnits');
    });

    it('should filter rooms by availability', async () => {
      const checkIn = '2024-12-20';
      const checkOut = '2024-12-25';

      const response = await fetch(
        `${API_URL}/rooms?checkIn=${checkIn}&checkOut=${checkOut}`
      );
      expect(response.status).toBe(200);

      const rooms = await response.json();
      expect(Array.isArray(rooms)).toBe(true);

      // All rooms should have availability info
      rooms.forEach((room: any) => {
        expect(room).toHaveProperty('availableUnits');
        expect(typeof room.availableUnits).toBe('number');
      });
    });

    it('should handle invalid date format gracefully', async () => {
      const response = await fetch(
        `${API_URL}/rooms?checkIn=invalid&checkOut=2024-12-25`
      );
      // Should either return 400 or 200 with all rooms
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('GET /api/v1/rooms/:id', () => {
    it('should fetch specific room details', async () => {
      // First get list of rooms
      const listResponse = await fetch(`${API_URL}/rooms`);
      const rooms = await listResponse.json();
      const roomId = rooms[0].id;

      const response = await fetch(`${API_URL}/rooms/${roomId}`);
      expect(response.status).toBe(200);

      const room = await response.json();
      expect(room).toHaveProperty('id', roomId);
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('amenities');
      expect(Array.isArray(room.amenities)).toBe(true);
    });

    it('should return 404 for non-existent room', async () => {
      const response = await fetch(
        `${API_URL}/rooms/non-existent-id-12345`
      );
      expect(response.status).toBe(404);

      const error = await response.json();
      expect(error).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/rooms/:id/availability', () => {
    it('should check room availability for date range', async () => {
      const listResponse = await fetch(`${API_URL}/rooms`);
      const rooms = await listResponse.json();
      const roomId = rooms[0].id;

      const response = await fetch(
        `${API_URL}/rooms/${roomId}/availability`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkInDate: '2024-12-20',
            checkOutDate: '2024-12-25',
            quantity: 2,
          }),
        }
      );

      expect(response.status).toBe(200);

      const availability = await response.json();
      expect(availability).toHaveProperty('isAvailable');
      expect(availability).toHaveProperty('availableUnits');
      expect(availability).toHaveProperty('totalUnits');
      expect(typeof availability.isAvailable).toBe('boolean');
    });

    it('should return 400 for invalid date range', async () => {
      const listResponse = await fetch(`${API_URL}/rooms`);
      const rooms = await listResponse.json();
      const roomId = rooms[0].id;

      const response = await fetch(
        `${API_URL}/rooms/${roomId}/availability`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkInDate: '2024-12-25',
            checkOutDate: '2024-12-20', // checkOut before checkIn
          }),
        }
      );

      expect(response.status).toBe(400);
    });

    it('should validate required fields', async () => {
      const listResponse = await fetch(`${API_URL}/rooms`);
      const rooms = await listResponse.json();
      const roomId = rooms[0].id;

      const response = await fetch(
        `${API_URL}/rooms/${roomId}/availability`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkInDate: '2024-12-20',
            // Missing checkOutDate
          }),
        }
      );

      expect(response.status).toBe(400);
    });
  });
});

describe('Room Data Validation', () => {
  it('should have valid price formats', async () => {
    const response = await fetch('http://localhost:3000/api/v1/rooms');
    const rooms = await response.json();

    rooms.forEach((room: any) => {
      expect(typeof room.basePrice).toBe('number');
      expect(room.basePrice).toBeGreaterThan(0);
      expect(room.basePrice).toBeLessThan(999999);
    });
  });

  it('should have valid amenities', async () => {
    const response = await fetch('http://localhost:3000/api/v1/rooms');
    const rooms = await response.json();

    rooms.forEach((room: any) => {
      if (room.amenities) {
        expect(Array.isArray(room.amenities)).toBe(true);
        room.amenities.forEach((amenity: any) => {
          expect(typeof amenity).toBe('string');
          expect(amenity.length).toBeGreaterThan(0);
        });
      }
    });
  });

  it('should have valid images array', async () => {
    const response = await fetch('http://localhost:3000/api/v1/rooms');
    const rooms = await response.json();

    rooms.forEach((room: any) => {
      if (room.images) {
        expect(Array.isArray(room.images)).toBe(true);
      }
    });
  });
});
