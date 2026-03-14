import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { GoogleAnalytics } from "@/app/components/analytics/GoogleAnalytics"; 
import { UIProvider } from "@/app/lib/ui-context";
import { ToastProvider } from "@/app/components/ui/toast-system";

import GlobalHeader from "@/app/components/layout/GlobalHeader";
import ScrollToTop from "@/app/components/layout/ScrollToTop";
import { ErrorBoundary } from "@/app/components/shared/ErrorBoundary";
import Toast from "@/app/shared/Toast";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://onetool.co.in";

export const metadata: Metadata = {
  title: {
    default: "OneTool — 150+ Free Online Tools for Finance, Business, Developer, Health & More",
    template: "%s | OneTool",
  },
  description: "OneTool gives you 150+ free online tools — GST calculator, EMI calculator, expense tracker, invoice generator, PDF tools, developer utilities, health calculators, AI tools, and more. No signup. Works in your browser.",
  keywords: "free online tools India, GST calculator, EMI calculator, expense tracker, invoice generator, PDF merge, developer tools, unit converter, budget planner, QR code generator, JSON formatter, SIP calculator, salary slip generator, BMI calculator, business tools India, onetool",
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
    title: "OneTool — Free Online Tools for Finance, Developer & Productivity",
    description: "60+ free browser-based tools: expense tracker, invoice generator, PDF tools, developer utilities & more. No signup required.",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "OneTool — Free Online Tools",
    description: "60+ free browser-based tools — expense tracker, invoice, PDF, developer tools & more. No signup.",
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
              description: 'Free online tools for finance, developer utilities, PDF tools, and productivity. No signup required.',
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
      <body className={inter.className}>
        <ErrorBoundary>
          <UIProvider>
            <ToastProvider>
              <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0F111A]">
                 <ScrollToTop />
                 <GlobalHeader />
                 <main className="flex-1 w-full max-w-[1800px] mx-auto">
                   <ErrorBoundary>
                     {children}
                   </ErrorBoundary>
                 </main>
              </div>
              <Toast />
              {/* Google Analytics */}
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || 'G-J4B6SYJZQF'} />
            </ToastProvider>
          </UIProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
