import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { GoogleAnalytics } from "@/app/components/analytics/GoogleAnalytics"; 
import { UIProvider } from "@/app/lib/ui-context";
import { ToastProvider } from "@/app/components/ui/toast-system";

import GlobalHeader from "@/app/components/layout/GlobalHeader";
import ScrollToTop from "@/app/components/layout/ScrollToTop";
import { ErrorBoundary } from "@/app/components/shared/ErrorBoundary";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "One Tool Solutions",
  description: "Your all-in-one productivity suite",
  manifest: "/manifest.json",
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
              {/* Google Analytics - only loads if NEXT_PUBLIC_ENABLE_ANALYTICS=true and NEXT_PUBLIC_GA_ID is set */}
              {process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
              )}
            </ToastProvider>
          </UIProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
