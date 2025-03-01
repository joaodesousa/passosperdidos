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
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "white",
          backgroundImage:
            "linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8))",
          backgroundSize: "1200px 630px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "40px 80px",
          position: "relative",
        }}
      >
        {/* Portuguese flag colors bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "12px",
            display: "flex",
            width: "100%",
          }}
        >
          <div style={{ flex: 2, backgroundColor: "#006600" }} />
          <div style={{ flex: 3, backgroundColor: "#FF0000" }} />
        </div>

        {/* Parliament silhouette */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "80px",
            opacity: 0.1,
            fontSize: "160px",
          }}
        >
          🏛️
        </div>
       
          <div
            style={{
              position: "absolute",
              top: "80px",
              left: "80px",
              backgroundColor: "#006600",
              color: "white",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            Passos Perdidos
          </div>
      
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "80%",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#333333",
              margin: "0 0 24px 0",
              lineHeight: 1.1,
            }}
          >
             {subtitle}
          </h1>

          <p
            style={{
              fontSize: "32px",
              color: "#666666",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {title}
          </p>
        </div>


        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333333",
              }}
            >
            
            </span>
          </div>

          <div
            style={{
              fontSize: "20px",
              color: "#666666",
            }}
          >
          
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