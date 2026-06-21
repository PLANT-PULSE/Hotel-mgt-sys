'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PaystackPayment from '@/components/paystack-payment';
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentDetails {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
}

export default function PaymentPage() {
  const [paymentState, setPaymentState] = useState<{
    status: 'idle' | 'processing' | 'success' | 'error';
    message: string;
    reference?: string;
  }>({
    status: 'idle',
    message: '',
  });

  // Example booking data - in production, this would come from props or URL params
  const [bookingDetails] = useState<PaymentDetails>({
    bookingId: 'BK-2024-001',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    roomType: 'Deluxe Suite',
    checkInDate: '2024-06-25',
    checkOutDate: '2024-06-28',
    numberOfNights: 3,
    pricePerNight: 50000,
    totalAmount: 150000,
  });

  const handlePaymentSuccess = (reference: string, data: any) => {
    setPaymentState({
      status: 'success',
      message: `Payment successful! Reference: ${reference}`,
      reference,
    });
  };

  const handlePaymentError = (error: string) => {
    setPaymentState({
      status: 'error',
      message: `Payment failed: ${error}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Complete your hotel booking payment with Paystack</p>
        </div>

        {/* Booking Summary */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-semibold text-gray-900">{bookingDetails.bookingId}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Guest Name:</span>
                <span className="font-semibold text-gray-900">{bookingDetails.guestName}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Room Type:</span>
                <span className="font-semibold text-gray-900">{bookingDetails.roomType}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-semibold text-gray-900">{bookingDetails.checkInDate}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-semibold text-gray-900">{bookingDetails.checkOutDate}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Number of Nights:</span>
                <span className="font-semibold text-gray-900">{bookingDetails.numberOfNights}</span>
              </div>
              <div className="flex justify-between pb-3 border-b">
                <span className="text-gray-600">Price per Night:</span>
                <span className="font-semibold text-gray-900">
                  ₦{bookingDetails.pricePerNight.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between bg-amber-50 p-3 rounded-lg">
                <span className="font-bold text-gray-900">Total Amount:</span>
                <span className="font-bold text-amber-600 text-lg">
                  ₦{bookingDetails.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        {paymentState.status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {paymentState.message}
            </AlertDescription>
          </Alert>
        )}

        {paymentState.status === 'error' && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {paymentState.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Method */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Pay securely with Paystack</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentState.status !== 'success' ? (
              <>
                {/* Guest Email */}
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingDetails.guestEmail}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This email will be used for payment confirmation
                  </p>
                </div>

                {/* Paystack Payment Button */}
                <PaystackPayment
                  email={bookingDetails.guestEmail}
                  amount={bookingDetails.totalAmount}
                  bookingId={bookingDetails.bookingId}
                  guestName={bookingDetails.guestName}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  isLoading={paymentState.status === 'processing'}
                />

                {/* Security Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and securely processed by Paystack. We never store your card details.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                <p className="text-gray-600">
                  Your booking has been confirmed. A confirmation email has been sent to{' '}
                  <strong>{bookingDetails.guestEmail}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Reference: <strong>{paymentState.reference}</strong>
                </p>
                <Button
                  onClick={() => setPaymentState({ status: 'idle', message: '' })}
                  className="mt-4"
                >
                  Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>📧 Contact: support@luxstay.com</p>
            <p>📞 Phone: +1 (800) 123-4567</p>
            <p>🌐 Visit: www.luxstay.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
