'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PaystackPaymentProps {
  email: string;
  amount: number;
  bookingId: string;
  guestName: string;
  onSuccess?: (reference: string, data: any) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

export default function PaystackPayment({
  email,
  amount,
  bookingId,
  guestName,
  onSuccess,
  onError,
  isLoading = false,
}: PaystackPaymentProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    // Load Paystack script
    if (!scriptRef.current) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
      scriptRef.current = script;
    }
  }, []);

  const handlePayment = async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      // Initialize payment
      const initResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount,
          bookingId,
          guestName,
        }),
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize payment');
      }

      const initData = await initResponse.json();

      // Check if Paystack is available
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        (window as any).PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email,
          amount: Math.round(amount * 100), // Convert to kobo/cents
          ref: initData.reference,
          onClose: () => {
            console.log('Payment window closed');
            isInitializing.current = false;
            onError?.('Payment cancelled');
          },
          onSuccess: async (response: any) => {
            // Verify payment on backend
            try {
              const verifyResponse = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reference: response.reference,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                onSuccess?.(response.reference, verifyData);
              } else {
                onError?.(verifyData.error || 'Payment verification failed');
              }
            } catch (err) {
              console.error('Verification error:', err);
              onError?.('Failed to verify payment');
            } finally {
              isInitializing.current = false;
            }
          },
        });

        (window as any).PaystackPop.openIframe();
      } else {
        throw new Error('Paystack is not loaded');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error instanceof Error ? error.message : 'Payment failed');
      isInitializing.current = false;
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handlePayment}
        disabled={isLoading || isInitializing.current}
        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
        size="lg"
      >
        {isLoading || isInitializing.current ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₦${amount.toLocaleString()}`
        )}
      </Button>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Powered by Paystack
      </p>
    </div>
  );
}
