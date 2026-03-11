import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20',
});

interface CreatePaymentIntentRequest {
  bookingId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentIntentRequest = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get existing payment intent if available
    const existingPayment = booking.payments[0];
    if (existingPayment && existingPayment.stripePaymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        existingPayment.stripePaymentIntentId
      );

      // Return existing payment intent if not yet succeeded
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: booking.totalAmount,
            currency: 'usd',
          },
          { status: 200 }
        );
      }
    }

    // Create new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(booking.totalAmount.toString()) * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        bookingId,
        bookingNumber: booking.bookingNumber,
        guestEmail: booking.guestEmail,
        guestName: `${booking.guestFirstName} ${booking.guestLastName}`,
      },
    });

    // Update or create payment record
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          currency: 'USD',
          method: 'STRIPE',
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
      });
    }

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: booking.totalAmount,
        currency: 'usd',
        bookingNumber: booking.bookingNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
