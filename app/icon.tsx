import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderRadius: 96,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 72, color: '#f59e0b', marginBottom: 8 }}>✦</div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              color: '#fbbf24',
              letterSpacing: -4,
            }}
          >
            L
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
