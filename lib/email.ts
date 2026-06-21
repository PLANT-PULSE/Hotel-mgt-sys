import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Bookings <noreply@bookings.platform>';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping:', subject);
    return { id: 'mock', skipped: true };
  }

  return resend.emails.send({ from: FROM_EMAIL, to, subject, html });
}

function layout(content: string, title: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">
  <div style="border-bottom:2px solid #e94560;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="margin:0;font-size:20px;">Booking Platform</h1>
  </div>
  ${content}
  <p style="margin-top:32px;font-size:12px;color:#666;">This is an automated message. Please do not reply.</p>
</body></html>`;
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Booking Platform',
    html: layout(`<h2>Welcome, ${name}!</h2><p>Your account has been created. Start exploring hotels and making reservations today.</p>`, 'Welcome'),
  }),

  emailVerification: (name: string, link: string) => ({
    subject: 'Verify your email address',
    html: layout(`<h2>Hi ${name},</h2><p>Please verify your email by clicking the link below:</p><p><a href="${link}" style="background:#e94560;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Verify Email</a></p>`, 'Verify Email'),
  }),

  bookingConfirmation: (data: { name: string; bookingNumber: string; checkIn: string; checkOut: string; total: string }) => ({
    subject: `Booking Confirmed – ${data.bookingNumber}`,
    html: layout(`<h2>Booking Confirmed</h2><p>Hi ${data.name},</p><p>Your booking <strong>${data.bookingNumber}</strong> is confirmed.</p><ul><li>Check-in: ${data.checkIn}</li><li>Check-out: ${data.checkOut}</li><li>Total: ${data.total}</li></ul>`, 'Booking Confirmation'),
  }),

  paymentReceipt: (data: { name: string; amount: string; transactionId: string }) => ({
    subject: 'Payment Receipt',
    html: layout(`<h2>Payment Received</h2><p>Hi ${data.name},</p><p>We received your payment of <strong>${data.amount}</strong>.</p><p>Transaction ID: ${data.transactionId}</p>`, 'Payment Receipt'),
  }),

  bookingReminder: (data: { name: string; bookingNumber: string; checkIn: string }) => ({
    subject: `Reminder: Upcoming stay – ${data.bookingNumber}`,
    html: layout(`<h2>Upcoming Booking</h2><p>Hi ${data.name},</p><p>Your check-in for booking <strong>${data.bookingNumber}</strong> is on ${data.checkIn}.</p>`, 'Booking Reminder'),
  }),

  cancellationNotice: (data: { name: string; bookingNumber: string }) => ({
    subject: `Booking Cancelled – ${data.bookingNumber}`,
    html: layout(`<h2>Booking Cancelled</h2><p>Hi ${data.name},</p><p>Your booking <strong>${data.bookingNumber}</strong> has been cancelled.</p>`, 'Cancellation'),
  }),

  refundNotification: (data: { name: string; amount: string }) => ({
    subject: 'Refund Processed',
    html: layout(`<h2>Refund Processed</h2><p>Hi ${data.name},</p><p>A refund of <strong>${data.amount}</strong> has been processed to your original payment method.</p>`, 'Refund'),
  }),

  newBookingOwner: (data: { bookingNumber: string; guestName: string; amount: string }) => ({
    subject: `New Booking – ${data.bookingNumber}`,
    html: layout(`<h2>New Booking Received</h2><p>Guest: ${data.guestName}</p><p>Booking: ${data.bookingNumber}</p><p>Amount: ${data.amount}</p>`, 'New Booking'),
  }),

  accountLocked: (name: string, lockedUntil: string) => ({
    subject: 'Security Alert: Account Temporarily Locked',
    html: layout(`<h2>Account Locked</h2><p>Hi ${name},</p><p>Your account was locked due to multiple failed login attempts. It will unlock at ${lockedUntil}.</p>`, 'Security Alert'),
  }),

  suspiciousActivity: (details: string) => ({
    subject: 'Security Alert: Suspicious Activity Detected',
    html: layout(`<h2>Suspicious Activity</h2><p>${details}</p>`, 'Security Alert'),
  }),
};
