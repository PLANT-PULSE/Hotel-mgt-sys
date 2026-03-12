import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStripePaymentIntentDto {
  @ApiProperty({ description: 'Booking ID' })
  @IsString()
  bookingId: string;

  @ApiPropertyOptional({ description: 'Amount to pay (defaults to remaining balance)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Payment Intent ID from Stripe' })
  @IsString()
  paymentIntentId: string;
}
