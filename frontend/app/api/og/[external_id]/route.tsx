import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { external_id: string } }
) {
  try {
    const externalId = params.external_id;
    
    // Fetch the proposal data
    const token = await getAuthToken();
    const response = await fetch(`https://legis.passosperdidos.pt/projetoslei?external_id=${externalId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const proposal = data.results[0];
    
    if (!proposal) {
      return new Response('Proposal not found', { status: 404 });
    }
    
    // Load the fonts
    const interSemiBold = await fetch(
      new URL('/public/fonts/Inter-SemiBold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());
    
    const interBold = await fetch(
      new URL('/public/fonts/Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

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
            backgroundColor: '#0f172a', // Dark blue background
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
                fontFamily: 'Inter',
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
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: 22,
                color: '#94a3b8',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {proposal.type}
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: 36,
                textAlign: 'center',
                color: 'white',
                maxWidth: 800,
                lineHeight: 1.4,
              }}
            >
              {proposal.title}
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
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: 18,
                  color: '#94a3b8',
                }}
              >
                Iniciativa: {proposal.external_id}
              </div>
            </div>
            <div
              style={{
                fontFamily: 'Inter',
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
        fonts: [
          {
            name: 'Inter',
            data: interSemiBold,
            weight: 600,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interBold,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

// Helper function to get auth token
async function getAuthToken() {
  // Implementation depends on your auth flow
  // You might need to adjust this based on your setup
  const response = await fetch('https://legis.passosperdidos.pt/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Your auth credentials
    }),
  });
  
  const data = await response.json();
  return data.access;
}