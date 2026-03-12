import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const configType = request.nextUrl.searchParams.get('type') || 'admin';

    // For now, return basic configuration
    // In production, this would load from the YAML files
    const configs = {
      admin: {
        features: {
          bookingManagement: true,
          roomManagement: true,
          calendarView: true,
          guestManagement: true,
          analytics: true,
          systemControls: true,
        },
        modules: [
          'Dashboard',
          'Bookings',
          'Rooms',
          'Guests',
          'Calendar',
          'Analytics',
        ],
      },
      user: {
        features: {
          roomBrowsing: true,
          booking: true,
          reservationTracking: true,
          guestProfile: true,
        },
        design: {
          colorScheme: 'dark',
          accentColor: 'amber',
          theme: 'modern',
        },
      },
    };

    const config = configs[configType as keyof typeof configs] || configs.admin;

    return NextResponse.json(
      {
        success: true,
        type: configType,
        config,
        timestamp: new Date().toISOString(),
        live: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Config API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load configuration',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
