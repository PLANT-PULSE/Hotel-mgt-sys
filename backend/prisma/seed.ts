import { PrismaClient, UserRole, RoomStatus, BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const HOTEL_IMAGES = {
  luxurySuite: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  deluxeRoom: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  penthouse: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  standardRoom: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
  familySuite: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  oceanView: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
};

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@luxehotel.com' },
    update: {},
    create: {
      email: 'admin@luxehotel.com',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  // Create Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@luxehotel.com' },
    update: {},
    create: {
      email: 'manager@luxehotel.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Manager',
      role: UserRole.MANAGER,
    },
  });

  // Create Receptionist
  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@luxehotel.com' },
    update: {},
    create: {
      email: 'reception@luxehotel.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Receptionist',
      role: UserRole.RECEPTIONIST,
    },
  });

  // Create Guest
  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: UserRole.GUEST,
    },
  });

  const guest = await prisma.guest.upsert({
    where: { userId: guestUser.id },
    update: {},
    create: {
      userId: guestUser.id,
      loyaltyPoints: 2450,
      loyaltyTier: 'SILVER',
    },
  });

  // Create Staff records
  await prisma.staff.upsert({
    where: { userId: manager.id },
    update: {},
    create: {
      userId: manager.id,
      department: 'Operations',
      employeeId: 'EMP-001',
      hireDate: new Date('2022-01-15'),
    },
  });

  await prisma.staff.upsert({
    where: { userId: receptionist.id },
    update: {},
    create: {
      userId: receptionist.id,
      department: 'Front Desk',
      employeeId: 'EMP-002',
      hireDate: new Date('2023-03-01'),
    },
  });

  // Room Types (matching frontend)
  const roomTypeData = [
    { name: 'Luxury Suite', type: 'suite', basePrice: 299, size: '65m²', maxGuests: 4, beds: 2, amenities: ['wifi', 'pool', 'spa', 'minibar'], image: HOTEL_IMAGES.luxurySuite, totalUnits: 3 },
    { name: 'Deluxe King Room', type: 'double', basePrice: 199, size: '45m²', maxGuests: 2, beds: 1, amenities: ['wifi', 'ac'], image: HOTEL_IMAGES.deluxeRoom, totalUnits: 5 },
    { name: 'Presidential Penthouse', type: 'penthouse', basePrice: 499, size: '120m²', maxGuests: 6, beds: 3, amenities: ['wifi', 'pool', 'spa', 'minibar', 'butler'], image: HOTEL_IMAGES.penthouse, totalUnits: 1 },
    { name: 'Standard Room', type: 'single', basePrice: 129, size: '30m²', maxGuests: 1, beds: 1, amenities: ['wifi', 'ac'], image: HOTEL_IMAGES.standardRoom, totalUnits: 8 },
    { name: 'Family Suite', type: 'suite', basePrice: 349, size: '85m²', maxGuests: 5, beds: 2, amenities: ['wifi', 'pool', 'minibar', 'kitchen'], image: HOTEL_IMAGES.familySuite, totalUnits: 2 },
    { name: 'Ocean View Deluxe', type: 'double', basePrice: 249, size: '50m²', maxGuests: 2, beds: 1, amenities: ['wifi', 'spa', 'ac', 'balcony'], image: HOTEL_IMAGES.oceanView, totalUnits: 4 },
  ];

  const roomTypes = [];
  for (const data of roomTypeData) {
    const existing = await prisma.roomType.findFirst({ where: { name: data.name } });
    const rt = existing || await prisma.roomType.create({ data });
    roomTypes.push(rt);
  }

  // Create physical rooms for each type (skip if already seeded)
  const roomCount = await prisma.room.count();
  if (roomCount === 0) {
    const roomNumbers = ['101', '102', '103', '201', '202', '203', '204', '205', '301', '302', '303', '401', '402', '501', '502', '601', '701'];
    let idx = 0;
    for (const rt of roomTypes) {
      const count = rt.totalUnits;
      for (let i = 0; i < count && idx < roomNumbers.length; i++) {
        await prisma.room.create({
          data: {
            roomTypeId: rt.id,
            number: roomNumbers[idx],
            floor: Math.floor(idx / 5) + 1,
            status: RoomStatus.AVAILABLE,
          },
        });
        idx++;
      }
    }
  }

  // Promo codes (matching frontend)
  const promoCodes = [
    { code: 'SAVE10', discount: 0.1, description: '10% Off' },
    { code: 'SAVE20', discount: 0.2, description: '20% Off' },
    { code: 'LUXURY50', discount: 0.5, description: '50% Off' },
    { code: 'WELCOME', discount: 0.15, description: '15% Welcome Discount' },
    { code: 'CORP01', discount: 0.25, description: '25% Corporate Discount' },
    { code: 'GROUP5', discount: 0.15, description: '15% Group Discount' },
  ];

  const now = new Date();
  const validTo = new Date(now.getFullYear() + 1, 11, 31);
  for (const p of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: p.code },
      update: {},
      create: {
        code: p.code,
        discount: p.discount,
        description: p.description,
        validFrom: now,
        validTo,
        maxUses: 1000,
      },
    });
  }

  // Add-ons (matching frontend)
  const addOns = [
    { key: 'breakfast', name: 'Daily Breakfast', price: 25 },
    { key: 'airportPickup', name: 'Airport Pickup', price: 45 },
    { key: 'spaCredit', name: '$50 Spa Credit', price: 50 },
    { key: 'lateCheckout', name: 'Late Checkout (2PM)', price: 35 },
    { key: 'extraBed', name: 'Extra Bed', price: 40 },
  ];

  for (const a of addOns) {
    await prisma.addOn.upsert({
      where: { key: a.key },
      update: {},
      create: a,
    });
  }

  // Sample booking (only if no bookings exist)
  const bookingCount = await prisma.booking.count();
  if (bookingCount === 0) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: `LXS-${new Date().getFullYear()}-${String(100001).padStart(5, '0')}`,
        guestId: guest.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        status: BookingStatus.CONFIRMED,
        totalAmount: 897,
        guestEmail: guestUser.email,
        guestFirstName: guestUser.firstName,
        guestLastName: guestUser.lastName,
        guestPhone: guestUser.phone,
      },
    });

    await prisma.bookingItem.create({
      data: {
        bookingId: booking.id,
        roomTypeId: roomTypes[0].id,
        quantity: 1,
        pricePerNight: 299,
        totalPrice: 897,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: 897,
        method: PaymentMethod.CARD,
        status: PaymentStatus.COMPLETED,
        transactionId: 'TXN-' + Date.now(),
        paidAt: new Date(),
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('Demo credentials:');
  console.log('  Admin: admin@luxehotel.com / Password123!');
  console.log('  Manager: manager@luxehotel.com / Password123!');
  console.log('  Reception: reception@luxehotel.com / Password123!');
  console.log('  Guest: guest@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
