import type { Metadata, Viewport } from "next";
// Font: Calibri (system font — no import needed)
import Script from "next/script";
import "./globals.css";

import { GoogleAnalytics } from "@/app/components/analytics/GoogleAnalytics";
import { UIProvider } from "@/app/lib/ui-context";
import { ToastProvider } from "@/app/components/ui/ToastSystem";
import { AuthProvider } from "@/app/contexts/auth-context";

import GlobalHeader from "@/app/components/layout/GlobalHeader";
import ScrollToTop from "@/app/components/layout/ScrollToTop";
import { ErrorBoundary } from "@/app/components/shared/ErrorBoundary";
import Toast from "@/app/shared/Toast";
import { OnboardingTour } from "@/app/components/onboarding/OnboardingTour";
import { PWAInstallPrompt } from "@/app/components/ui/PWAInstallPrompt";
import { DemoJourneyBanner } from "@/app/components/ui/DemoJourneyBanner";
import { StorageQuotaToast } from "@/app/components/ui/StorageQuotaToast";


const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://onetool.co.in";

export const metadata: Metadata = {
  title: {
    default: "OneTool — Free Personal Finance & Small Business Tools for India",
    template: "%s | OneTool",
  },
  description: "OneTool gives you 70+ free finance and business tools — bank statement analyzer, expense tracker, budget planner, GST calculator, invoice generator, EMI & SIP calculators, income tax tools, and small business accounting. No signup. Works in your browser.",
  keywords: "free finance tools India, personal finance tracker, bank statement analyzer, GST calculator, EMI calculator, expense tracker, invoice generator, budget planner, SIP calculator, income tax calculator India, small business accounting India, Khata app, onetool",
  manifest: "/manifest.json",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
    },
  }),
  openGraph: {
    type: "website",
    siteName: "OneTool",
    title: "OneTool — Free Personal Finance & Small Business Tools for India",
    description: "70+ free finance & business tools: bank statement analyzer, budget planner, GST calculator, invoicing, EMI & SIP calculators, and more. No signup required.",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "OneTool — Free Finance & Business Tools",
    description: "70+ free finance & business tools — bank statements, budgets, GST, invoicing, EMI & SIP calculators. No signup.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OneTool",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F111A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Brand typeface — IBM Plex Sans/Mono, see one-tool-brand style guide */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
        {/* Dark mode initialiser — runs before paint to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Organization structured data — helps Google identify the site entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'OneTool',
              url: baseUrl,
              logo: `${baseUrl}/logo/ots.svg`,
              description: 'Free online tools for personal finance and small business — bank statements, budgets, GST, invoicing, and tax. No signup required.',
              sameAs: [],
            }),
          }}
        />
        {/* WebSite structured data — enables sitelinks searchbox in Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'OneTool',
              url: baseUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${baseUrl}/?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* AdSense — only loads when NEXT_PUBLIC_ADSENSE_ID is configured */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <UIProvider>
              <ToastProvider>
                <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0F111A]">
                   <ScrollToTop />
                   <GlobalHeader />
                   <main className="flex-1 w-full">
                     <ErrorBoundary>
                       {children}
                     </ErrorBoundary>
                   </main>
                </div>
                <Toast />
                <OnboardingTour />
                <PWAInstallPrompt />
                <DemoJourneyBanner />
                <StorageQuotaToast />
                {/* Google Analytics */}
                {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
              </ToastProvider>
            </UIProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
