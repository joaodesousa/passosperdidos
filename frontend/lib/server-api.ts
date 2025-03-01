// frontend/lib/server-api.ts
import { Proposal } from './types';

/**
 * Get auth token from the API - Server-side version
 */
export async function getServerAuthToken() {
  try {
    const API_BASE_URL = process.env.API_BASE_URL;
    
    const response = await fetch(`${API_BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD,
      }),
      next: { revalidate: 3600 } // Revalidate token cache every hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.access;
  } catch (error) {
    console.error("Error getting auth token:", error);
    throw error;
  }
}

/**
 * Fetch a proposal by its external ID - Server-side version
 */
export async function getProposalForId(externalId: string): Promise<Proposal | null> {
  try {
    const token = await getServerAuthToken();
    const API_BASE_URL = process.env.API_BASE_URL || 'https://legis.passosperdidos.pt';
    
    const response = await fetch(`${API_BASE_URL}/projetoslei?external_id=${externalId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0] as Proposal;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return null;
  }
}