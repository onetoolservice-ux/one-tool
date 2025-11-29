import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context"; // Import Provider
import Navbar from "@/app/shared/layout/Navbar";
 // Updated Nav

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "One Tool | The Privacy-First Digital Toolkit",
  description: "A complete toolkit for Finance, Documents, Health, and Developers. 100% Offline.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} font-sans bg-background dark:bg-surface dark:bg-slate-950 text-main dark:text-slate-50 dark:text-slate-100 antialiased`}>
        <UIProvider>
          <Navbar />
          <main className="flex-grow pt-16 pb-10">
            {children}
          </main>
        
        </UIProvider>
      </body>
    </html>
  );
}
