import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context";
import Navbar from "@/app/shared/layout/Navbar";
import Sidebar from "@/app/components/layout/Sidebar";
import Footer from "@/app/shared/layout/Footer";
import ThemeEngine from "./components/layout/ThemeEngine"; 
import UseScrollToTop from "./utils/hooks/useScrollToTop";
import PageWrapper from "@/app/components/layout/PageWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "One Tool | The Privacy-First Digital Toolkit",
  description: "A complete toolkit for Finance, Documents, Health, and Developers. 100% Offline.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

// FIX: Removed 'userScalable: false' (Critical Lighthouse Fix)
export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
        <UIProvider>
          <ThemeEngine />
          <UseScrollToTop />
          <Navbar />
          <Sidebar />
          <PageWrapper>
            {children}
          </PageWrapper>
        </UIProvider>
      </body>
    </html>
  );
}
