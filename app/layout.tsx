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
  title: {
    default: "OneTool — Free Online Tools for Finance, Developer & Productivity",
    template: "%s | OneTool",
  },
  description: "OneTool gives you 60+ free online tools — expense tracker, invoice generator, PDF tools, developer utilities, unit converters, and more. No signup. Works in your browser.",
  keywords: "free online tools, expense tracker, invoice generator, PDF merge, developer tools, unit converter, GST calculator, budget planner, QR code generator, JSON formatter, password generator, onetool",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://onetool.co.in"),
  openGraph: {
    type: "website",
    siteName: "OneTool",
    title: "OneTool — Free Online Tools for Finance, Developer & Productivity",
    description: "60+ free browser-based tools: expense tracker, invoice generator, PDF tools, developer utilities & more. No signup required.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://onetool.co.in",
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
