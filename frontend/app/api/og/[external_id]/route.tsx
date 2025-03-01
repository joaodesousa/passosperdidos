// app/api/og/route.ts
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Passos Perdidos';
  const subtitle = searchParams.get('subtitle') || 'Iniciativa Legislativa';
  
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
        <div style={{ fontSize: 24, color: '#94a3b8', marginBottom: 16 }}>
          {subtitle}
        </div>
        <div style={{ 
          fontSize: 36, 
          color: 'white', 
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: '80%'
        }}>
          {title}
        </div>
        <div style={{
          position: 'absolute',
          bottom: 40,
          fontSize: 18,
          color: '#94a3b8'
        }}>
          passosperdidos.pt
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}