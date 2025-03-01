"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Share2, Copy, Facebook, Twitter, Linkedin, Check, 
  MessageCircle, X as XIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export function ShareButton({ 
  url, 
  title = "Iniciativa Legislativa", 
  description = "Veja esta iniciativa legislativa no Passos Perdidos", 
  size = "sm",
  variant = "outline",
  className = ""
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareSupported, setShareSupported] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Get current URL or use provided URL
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : "");
    
    // Clean the URL by removing all parameters
    const cleanUrl = removeAllParams(currentUrl);
    
    setShareUrl(cleanUrl);
    
    // Check if Web Share API is supported
    setShareSupported(typeof navigator !== 'undefined' && !!navigator.share);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url]);

  // Function to remove all parameters from URL
  const removeAllParams = (inputUrl: string): string => {
    try {
      const urlObj = new URL(inputUrl);
      // Return just the origin + pathname (no search params or hash)
      return urlObj.origin + urlObj.pathname;
    } catch (e) {
      // If URL parsing fails, return the original URL
      return inputUrl;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success("Link copiado para a área de transferência!");
        
        if (dropdownRef.current) {
          timeoutRef.current = setTimeout(() => {
            setCopied(false);
          }, 2000);
        }
      })
      .catch(() => {
        toast.error("Não foi possível copiar o link");
      });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: description,
        url: shareUrl,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    }
  };

  const handleShareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleShareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(description)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleShareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const handleShareToReddit = () => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
    window.open(redditUrl, '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className}`}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Partilhar
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" ref={dropdownRef}>
        {shareSupported && (
          <>
            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
              <Share2 className="mr-2 h-4 w-4" />
              <span>Partilhar nativamente</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>{copied ? "Copiado!" : "Copiar link"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleShareToFacebook} className="cursor-pointer">
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          <span>Facebook</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareToTwitter} className="cursor-pointer">
          <XIcon className="mr-2 h-4 w-4" />
          <span>X</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareToLinkedIn} className="cursor-pointer">
          <Linkedin className="mr-2 h-4 w-4 text-blue-700" />
          <span>LinkedIn</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleShareToReddit} className="cursor-pointer">
          <MessageCircle className="mr-2 h-4 w-4 text-orange-600" />
          <span>Reddit</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}