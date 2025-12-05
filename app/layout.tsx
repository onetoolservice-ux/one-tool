import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { DynamicBackground } from '@/app/components/layout/dynamic-background';
import { ToastProvider } from '@/app/components/ui/toast-provider';
import { WelcomeToast } from '@/app/components/home/welcome-toast';
import { GoogleAnalytics } from '@/app/components/analytics/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'], display: 'swap' }); // Font Optimization

export const metadata: Metadata = {
  title: 'OneTool | The Enterprise OS',
  description: '63+ Professional Tools. Secure, Client-Side, Free.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-100 selection:text-teal-900`}>
         
         {/* ANALYTICS: Moved to Component for cleaner control */}
         <GoogleAnalytics />

         <ToastProvider>
            <DynamicBackground />
            <div className="flex flex-col min-h-screen relative">
              {children}
            </div>
            <WelcomeToast />
         </ToastProvider>
      </body>
    </html>
  );
}