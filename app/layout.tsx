import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/shared/layout/Navbar";
import Footer from "@/app/shared/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://onetool.vercel.app'),
  title: {
    default: "One Tool Solutions | Privacy-First Workspace",
    template: "%s | One Tool"
  },
  description: "Free, local-first tools for Finance, Documents, and Health. No servers, no tracking, just utility.",
  keywords: ["budget tracker", "pdf merger", "image compressor", "bmi calculator", "privacy tools", "offline pwa"],
  authors: [{ name: "One Tool Team" }],
  openGraph: {
    title: "One Tool Solutions",
    description: "Your digital life, simplified. 15+ Tools running 100% offline.",
    url: 'https://onetool.vercel.app',
    siteName: 'One Tool Solutions',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "One Tool Solutions",
    description: "Privacy-first Finance & Document tools.",
  },
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
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50/50 text-slate-900`}>
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
