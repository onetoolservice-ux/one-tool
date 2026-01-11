"use client";
import { useEffect } from 'react';
import { useToast } from '@/app/components/ui/toast-provider';
import { safeLocalStorage } from '@/app/lib/utils/storage';

export const WelcomeToast = () => {
  const { showToast } = useToast();

  useEffect(() => {
    // UPDATED KEY: v3 forces it to show again for you
    const hasVisited = safeLocalStorage.getItem<string>('onetool-visited-v3', null); 
    
    if (!hasVisited) {
      const timer = setTimeout(() => {
         showToast("Welcome to OneTool Enterprise. Secure & Offline.", "welcome");
         safeLocalStorage.setItem('onetool-visited-v3', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};
