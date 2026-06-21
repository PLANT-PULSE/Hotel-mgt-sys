import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        <div style={{ fontSize: 36, color: '#f59e0b' }}>✦</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#fbbf24',
            letterSpacing: -2,
          }}
        >
          L
        </div>
      </div>
    ),
    { ...size },
  );
}
