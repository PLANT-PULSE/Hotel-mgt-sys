import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { broadcastBookingNotification, recalculateAndBroadcastAvailability } from '@/lib/websocket-events';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
});

interface ConfirmBookingRequest {
  bookingId: string;
  paymentIntentId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmBookingRequest = await request.json();
    const { bookingId, paymentIntentId } = body;

    if (!bookingId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'bookingId and paymentIntentId are required' },
        { status: 400 }
      );
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Update booking status to confirmed
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    // Create notification for booking confirmation
    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        type: 'bookingConfirmation',
        title: 'Booking Confirmed',
        message: `Your booking ${booking.bookingNumber} has been confirmed.`,
        email: booking.guestEmail,
      },
    });

    // Get room type IDs to broadcast availability updates
    const roomTypeIds = booking.items.map((item) => item.roomTypeId);

    // Broadcast booking confirmation and availability updates
    roomTypeIds.forEach((roomTypeId) => {
      broadcastBookingNotification(
        'booking-confirmed',
        booking.bookingNumber,
        roomTypeId,
        booking.guestEmail
      );
      recalculateAndBroadcastAvailability(roomTypeId, prisma);
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          status: 'CONFIRMED',
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          totalAmount: booking.totalAmount,
          guestEmail: booking.guestEmail,
        },
        message: 'Booking confirmed successfully. Confirmation email sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error confirming booking:', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
