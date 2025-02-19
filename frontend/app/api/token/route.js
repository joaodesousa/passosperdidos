// app/api/get-token/route.js
export async function POST(request) {
    const API_BASE_URL = process.env.API_BASE_URL;
  
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Use environment variables that are defined only on the server
      body: JSON.stringify({
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD,
      }),
    });
  
    const data = await response.json();
    return new Response(JSON.stringify({ access: data.access }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  