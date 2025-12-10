import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { GoogleAnalytics } from "@/app/components/analytics/GoogleAnalytics"; 
import { UIProvider } from "@/app/lib/ui-context";
import { ToastProvider } from "@/app/components/ui/toast-system";
import GlobalHeader from "@/app/components/layout/GlobalHeader";
import ScrollToTop from "@/app/components/layout/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "One Tool Solutions",
  description: "Your all-in-one productivity suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <UIProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0F111A]">
               <ScrollToTop />
               <GlobalHeader />
               <main className="flex-1 w-full max-w-[1800px] mx-auto">
                 {children}
               </main>
            </div>
            {/* FIX: Using your REAL Measurement ID from the screenshot */}
            <GoogleAnalytics gaId="G-J4B6SYJZQF" /> 
          </ToastProvider>
        </UIProvider>
      </body>
    </html>
  );
}
