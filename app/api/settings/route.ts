import { NextRequest, NextResponse } from 'next/server';

interface SettingsData {
  hotelName: string;
  hotelEmail: string;
  hotelPhone: string;
  hotelAddress: string;
  city: string;
  country: string;
  zipCode: string;
  website: string;
  description: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlert: boolean;
  bookingConfirmation: boolean;
}

let settingsData: SettingsData = {
  hotelName: 'LuxStay Hotel',
  hotelEmail: 'info@luxstay.com',
  hotelPhone: '+1 (800) 123-4567',
  hotelAddress: '123 Luxury Lane',
  city: 'New York',
  country: 'United States',
  zipCode: '10001',
  website: 'www.luxstay.com',
  description: 'A luxury 5-star hotel offering premium accommodations and world-class service.',
  currency: 'USD',
  timezone: 'UTC-5',
  emailNotifications: true,
  smsNotifications: false,
  lowStockAlert: true,
  bookingConfirmation: true,
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: settingsData,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SettingsData = await request.json();

    // Validate required fields
    if (!body.hotelName || !body.hotelEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update settings (in a real app, this would be saved to a database)
    settingsData = {
      ...settingsData,
      ...body,
    };

    // In production, you would save to your backend:
    // await backendFetch('/settings', { method: 'POST', body: JSON.stringify(body) }, true);

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      data: settingsData,
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
