-- Add Stripe PaymentMethod enum value
ALTER TYPE "PaymentMethod" ADD VALUE 'STRIPE';

-- Add images array and Stripe fields to payments
ALTER TABLE "room_types" ADD COLUMN "images" text[] DEFAULT ARRAY[]::text[];

ALTER TABLE "payments" ADD COLUMN "stripe_payment_intent_id" text;
ALTER TABLE "payments" ADD COLUMN "stripe_client_secret" text;

CREATE INDEX "payments_stripe_payment_intent_id_idx" ON "payments"("stripe_payment_intent_id");

-- Create Reservations table for temporary holds
CREATE TABLE "reservations" (
  id text PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id text,
  room_type_id text NOT NULL,
  session_id text NOT NULL,
  check_in_date timestamp(3) NOT NULL,
  check_out_date timestamp(3) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  status text DEFAULT 'ACTIVE',
  expires_at timestamp(3) NOT NULL,
  created_at timestamp(3) DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reservations_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE
);

CREATE INDEX "reservations_session_id_idx" ON "reservations"("session_id");
CREATE INDEX "reservations_room_type_id_idx" ON "reservations"("room_type_id");
CREATE INDEX "reservations_check_in_date_check_out_date_idx" ON "reservations"("check_in_date", "check_out_date");
CREATE INDEX "reservations_expires_at_idx" ON "reservations"("expires_at");
