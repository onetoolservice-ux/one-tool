"use client";
import { useEffect } from 'react';
import { useToast } from '@/app/components/ui/toast-provider';

export const WelcomeToast = () => {
  const { showToast } = useToast();

  useEffect(() => {
    // UPDATED KEY: v3 forces it to show again for you
    const hasVisited = localStorage.getItem('onetool-visited-v3'); 
    
    if (!hasVisited) {
      const timer = setTimeout(() => {
         showToast("Welcome to OneTool Enterprise. Secure & Offline.", "welcome");
         localStorage.setItem('onetool-visited-v3', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};
