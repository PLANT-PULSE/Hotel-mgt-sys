import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_key_here';

interface VerifyPaymentRequest {
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPaymentRequest = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing payment reference' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const { status, data: paymentData } = data;

    // Check if payment was successful
    if (paymentData.status === 'success') {
      // Here you would update your database with the payment information
      // Example:
      // await updateBookingPayment(paymentData.metadata.bookingId, {
      //   status: 'paid',
      //   reference,
      //   amount: paymentData.amount / 100,
      //   paidAt: new Date(),
      // });

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        reference,
        amount: paymentData.amount / 100,
        bookingId: paymentData.metadata?.bookingId,
        guestName: paymentData.metadata?.guestName,
        customerEmail: paymentData.customer?.email,
        paidAt: paymentData.paid_at,
      });
    }

    return NextResponse.json(
      { error: 'Payment not successful' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for Paystack callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect('/booking?error=No reference provided');
    }

    // Verify the payment
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await verifyResponse.json();

    if (data.status && data.data.status === 'success') {
      const bookingId = data.data.metadata?.bookingId;
      return NextResponse.redirect(`/booking?success=true&reference=${reference}&bookingId=${bookingId}`);
    }

    return NextResponse.redirect('/booking?error=Payment verification failed');
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect('/booking?error=An error occurred');
  }
}
