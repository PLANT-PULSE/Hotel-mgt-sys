import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { broadcastBookingNotification } from '@/lib/websocket-events';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
});

interface CreateBookingRequest {
  roomTypeId: string;
  quantity: number;
  checkInDate: string;
  checkOutDate: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  promoCodeId?: string;
  addOns?: Array<{
    addOnId: string;
    quantity: number;
  }>;
}

function generateBookingNumber(): string {
  // Format: LXS-2024-XXXXX
  const year = new Date().getFullYear();
  const random = nanoid(5).toUpperCase();
  return `LXS-${year}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();

    // Validate required fields
    const {
      roomTypeId,
      quantity,
      checkInDate,
      checkOutDate,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      specialRequests,
      promoCodeId,
      addOns = [],
    } = body;

    if (!roomTypeId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'roomTypeId, checkInDate, and checkOutDate are required' },
        { status: 400 }
      );
    }

    if (!guestFirstName || !guestLastName || !guestEmail) {
      return NextResponse.json(
        { error: 'Guest information is required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'checkOutDate must be after checkInDate' },
        { status: 400 }
      );
    }

    // Check room availability
    const availabilityCheck = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      select: { basePrice: true, totalUnits: true },
    });

    if (!availabilityCheck) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Count booked units
    const bookedUnits = await prisma.bookingItem.count({
      where: {
        roomTypeId,
        booking: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN'],
          },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      },
    });

    if (availabilityCheck.totalUnits - bookedUnits < quantity) {
      return NextResponse.json(
        {
          error: 'Not enough rooms available for the selected dates',
          available: availabilityCheck.totalUnits - bookedUnits,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    // Calculate nights
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate room price
    const roomPrice = parseFloat(availabilityCheck.basePrice.toString());
    const roomTotalPrice = roomPrice * nights * quantity;

    // Calculate add-ons total (if provided)
    let addOnsTotalPrice = 0;
    const addOnDetails = [];

    if (addOns.length > 0) {
      for (const addOn of addOns) {
        const addOnData = await prisma.addOn.findUnique({
          where: { id: addOn.addOnId },
        });
        if (addOnData) {
          const addOnPrice = parseFloat(addOnData.price.toString());
          addOnsTotalPrice += addOnPrice * addOn.quantity;
          addOnDetails.push({
            addOnId: addOn.addOnId,
            quantity: addOn.quantity,
            price: addOnPrice,
          });
        }
      }
    }

    // Apply promo code if provided
    let totalAmount = roomTotalPrice + addOnsTotalPrice;
    let discountAmount = 0;

    if (promoCodeId) {
      const promoCode = await prisma.promoCode.findUnique({
        where: { id: promoCodeId },
      });

      if (promoCode && promoCode.isActive) {
        const now = new Date();
        if (now >= promoCode.validFrom && now <= promoCode.validTo) {
          if (!promoCode.maxUses || promoCode.usedCount < promoCode.maxUses) {
            discountAmount = parseFloat(
              (totalAmount * parseFloat(promoCode.discount.toString())).toFixed(2)
            );
            totalAmount = Math.max(0, totalAmount - discountAmount);
          }
        }
      }
    }

    // Create booking with Stripe payment intent
    const bookingNumber = generateBookingNumber();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        bookingNumber,
        guestEmail,
        guestName: `${guestFirstName} ${guestLastName}`,
      },
    });

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestFirstName,
        guestLastName,
        guestEmail,
        guestPhone,
        specialRequests,
        status: 'PENDING',
        totalAmount,
        currency: 'USD',
        items: {
          create: {
            roomTypeId,
            quantity,
            pricePerNight: roomPrice,
            totalPrice: roomTotalPrice,
          },
        },
        payments: {
          create: {
            amount: totalAmount,
            currency: 'USD',
            method: 'STRIPE',
            status: 'PENDING',
            stripePaymentIntentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
          },
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // Add add-ons if provided
    if (addOnDetails.length > 0) {
      for (const addOn of addOnDetails) {
        await prisma.bookingAddOn.create({
          data: {
            bookingId: booking.id,
            addOnId: addOn.addOnId,
            quantity: addOn.quantity,
            price: addOn.price,
          },
        });
      }
    }

    // Update promo code usage count
    if (promoCodeId) {
      await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Broadcast booking notification to connected clients
    broadcastBookingNotification(
      'booking-created',
      booking.bookingNumber,
      roomTypeId,
      guestEmail
    );

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          totalAmount: booking.totalAmount,
          guestEmail: booking.guestEmail,
          status: booking.status,
        },
        payment: {
          id: booking.payments[0].id,
          clientSecret: paymentIntent.client_secret,
          amount: totalAmount,
          currency: 'USD',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
