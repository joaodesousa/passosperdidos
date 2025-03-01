// components/page-header.tsx
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./share-button";
import { Proposal } from "../../../../lib/types";

interface PageHeaderProps {
  proposal?: Proposal;
}

export function PageHeader({ proposal }: PageHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  
  const handleGoBack = () => {
    if (returnTo) {
      router.push(decodeURIComponent(returnTo));
    } else {
      router.push('/');
    }
  };

  const handlePrintClick = () => {
    window.print();
  };

  // Prepare share content if proposal is available
  const shareTitle = proposal 
    ? `${proposal.type}: ${proposal.title}` 
    : "Iniciativa Legislativa";
    
  const shareDescription = proposal 
    ? `Veja os detalhes da iniciativa legislativa "${proposal.title}" no Passos Perdidos` 
    : "Veja esta iniciativa legislativa no Passos Perdidos";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 print:hidden">
      <Button 
        onClick={handleGoBack} 
        className="inline-flex items-center text-blue-600 bg-transparent hover:text-blue-800 hover:bg-transparent mb-2 sm:mb-0"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a lista
      </Button>
      
      <div className="flex space-x-2">
        <ShareButton 
          title={shareTitle}
          description={shareDescription}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrintClick}
          className="flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>
    </div>
  );
}