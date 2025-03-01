"use client"

import { useEffect } from 'react'

interface AppTitleProps {
  title: string;
}

export function AppTitle({ title }: AppTitleProps) {
  useEffect(() => {
    
    document.title = title;
    
   
    return () => {
      document.title = 'Passos Perdidos';
    };
  }, [title]);


  return null;
}