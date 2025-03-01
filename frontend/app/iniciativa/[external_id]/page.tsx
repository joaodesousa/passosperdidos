import { Suspense } from 'react';
import { Metadata, ResolvingMetadata } from 'next';

// Import components
import Loading from '../../loading';
import { DetailContent } from './detail-content';

// Generate metadata
export async function generateMetadata(
  { params }: { params: { external_id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Instead of defining a static title here,
  // let the DetailContent component handle the title with useEffect
  
  // Return a minimal metadata object
  // The title will be set on the client side
  return {
    title: 'Passos Perdidos', // Use your site name as a fallback
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