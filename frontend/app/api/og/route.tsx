// app/api/og/route.ts
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Passos Perdidos';
    const subtitle = searchParams.get('subtitle') || 'Iniciativa Legislativa';
    
    // Create the OpenGraph image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
            padding: '40px 60px',
          }}
        >
          {/* Logo or header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <div
              style={{
                height: 24,
                width: 24,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                marginRight: 8,
              }}
            />
            <span
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 600,
                fontSize: 24,
                color: 'white',
              }}
            >
              Passos Perdidos
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 30,
            }}
          >
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 500,
                fontSize: 22,
                color: '#94a3b8',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {subtitle}
            </div>
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 700,
                fontSize: 36,
                textAlign: 'center',
                color: 'white',
                maxWidth: 800,
                lineHeight: 1.4,
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 'auto',
              paddingTop: 32,
              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            }}
          >
            <div
              style={{
                fontFamily: 'sans-serif',
                fontWeight: 500,
                fontSize: 18,
                color: '#94a3b8',
              }}
            >
              passosperdidos.pt
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}