import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { DynamicBackground } from '@/app/components/layout/dynamic-background';
import { ToastProvider } from '@/app/components/ui/toast-provider';
import { WelcomeToast } from '@/app/components/home/welcome-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OneTool | The Enterprise OS',
  description: '63+ Professional Tools. Secure, Client-Side, Free.',
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification-code-here',
  },
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
        
        {/* GOOGLE ANALYTICS */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G250LVCNPK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G250LVCNPK');
          `}
        </Script>

        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(_){}`,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100`}>
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
