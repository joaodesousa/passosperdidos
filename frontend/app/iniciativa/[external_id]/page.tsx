// frontend/app/iniciativa/[external_id]/page.tsx
import { Suspense } from 'react';
import { Metadata, ResolvingMetadata } from 'next';

// Import components
import Loading from '../../loading';
import { DetailContent } from './detail-content';

// Import API functions (create this if needed)
import { getProposalForId } from '../../../lib/server-api'; // You'll need to create this

// Generate metadata
export async function generateMetadata(
  { params }: { params: { external_id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    // Try to fetch the proposal data
    const proposal = await getProposalForId(params.external_id);
    
    if (proposal) {
      return {
        title: `${proposal.type}: ${proposal.title}`,
        description: proposal.description || `Detalhes da iniciativa legislativa ${params.external_id}`,
        openGraph: {
          title: `${proposal.type}: ${proposal.title}`,
          description: proposal.description || `Detalhes da iniciativa legislativa ${params.external_id}`,
          type: 'article',
          url: `https://passosperdidos.pt/iniciativa/${params.external_id}`,
          images: [{
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://passosperdidos.pt'}/api/og?title=${encodeURIComponent(proposal.title)}&subtitle=${encodeURIComponent(proposal.type)}`,
            width: 1200,
            height: 630,
            alt: proposal.title,
          }],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${proposal.type}: ${proposal.title}`,
          description: proposal.description || `Detalhes da iniciativa legislativa ${params.external_id}`,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  // Fallback metadata
  return {
    title: 'Iniciativa Legislativa | Passos Perdidos',
    description: 'Detalhes da iniciativa legislativa',
  };
}

// Main page component
export default function ProposalDetails({ params }: { 
  params: { external_id: string } 
}) {
  return (
    <Suspense fallback={<Loading />}>
      <DetailContent externalId={params.external_id} />
    </Suspense>
  );
}