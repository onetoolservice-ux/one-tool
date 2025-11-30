#!/bin/bash

echo "âš–ï¸ Activating Trust Layer (Legal, About, Footer)..."

# =========================================================
# 1. GLOBAL FOOTER
# =========================================================
echo "í¶¶ Building Professional Footer..."
cat > app/shared/layout/Footer.tsx << 'TS_END'
import Link from "next/link";
import { Github, Twitter, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
      <div className="max-w-[1800px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">OT</div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">One Tool</span>
           </div>
           <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
             The privacy-first digital command center. 50+ tools running 100% offline in your browser. No tracking, no servers, no ads.
           </p>
           <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-indigo-500 transition"><Github size={20}/></a>
              <a href="#" className="hover:text-indigo-500 transition"><Twitter size={20}/></a>
              <a href="#" className="hover:text-indigo-500 transition"><Mail size={20}/></a>
           </div>
        </div>

        {/* Links 1 */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Platform</h3>
           <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/tools/finance" className="hover:text-indigo-500">Finance Suite</Link></li>
              <li><Link href="/tools/developer" className="hover:text-indigo-500">Developer Tools</Link></li>
              <li><Link href="/tools/documents" className="hover:text-indigo-500">Document Tools</Link></li>
              <li><Link href="/ai" className="hover:text-indigo-500">AI Assistant</Link></li>
           </ul>
        </div>

        {/* Links 2 */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Company</h3>
           <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/about" className="hover:text-indigo-500">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-500">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-500">Terms of Service</Link></li>
              <li><a href="mailto:support@onetool.co" className="hover:text-indigo-500">Contact</a></li>
           </ul>
        </div>

        {/* Status */}
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white mb-4">Status</h3>
           <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg w-fit">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              All Systems Operational
           </div>
           <p className="text-xs text-slate-400 mt-4">
              v2.1.0 â€¢ Local Execution
           </p>
        </div>

      </div>
      
      <div className="max-w-[1800px] mx-auto px-8 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 flex justify-between items-center">
         <p>&copy; {year} One Tool Inc. All rights reserved.</p>
         <div className="flex items-center gap-1"><ShieldCheck size={14}/> Security Audited</div>
      </div>
    </footer>
  );
}
TS_END

# =========================================================
# 2. INJECT FOOTER INTO LAYOUT
# =========================================================
echo "í´Œ Wiring Footer to Global Layout..."
# We need to import Footer and add it after children
cat > app/layout.tsx << 'TS_END'
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/app/lib/ui-context";
import Navbar from "@/app/shared/layout/Navbar";
import Sidebar from "@/app/components/layout/Sidebar";
import Footer from "@/app/shared/layout/Footer"; // New Import
import ThemeEngine from "./components/layout/ThemeEngine"; 
import UseScrollToTop from "./utils/hooks/useScrollToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "One Tool | The Privacy-First Digital Toolkit",
  description: "A complete toolkit for Finance, Documents, Health, and Developers. 100% Offline.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
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
          <ThemeEngine />
          <UseScrollToTop />
          <Navbar /> 
          
          <div className="flex h-screen pt-16">
              <Sidebar />
              
              <main className="flex-1 overflow-y-auto relative lg:ml-64 flex flex-col">
                <div className="flex-grow">
                  {children}
                </div>
                <Footer /> {/* Added to bottom of scrollable area */}
              </main>
          </div>
          
        </UIProvider>
      </body>
    </html>
  );
}
TS_END

# =========================================================
# 3. PRIVACY POLICY PAGE
# =========================================================
echo "í³œ Creating Privacy Policy..."
cat > app/privacy/page.tsx << 'TS_END'
"use client";
import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-16 space-y-8">
       <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
       <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
          <p className="lead text-xl">At One Tool, we believe your data belongs to you. Period.</p>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. No Server Tracking</h3>
          <p>One Tool operates as a <strong>Client-Side Application (PWA)</strong>. When you use tools like "Smart Budget" or "Password Generator," the logic runs entirely inside your browser. No data is sent to our servers.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Local Storage</h3>
          <p>All user data (budgets, notes, settings) is stored in your device's <code>localStorage</code>. This means if you clear your browser cache, your data is removed. We do not have a copy.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Analytics</h3>
          <p>We do not use Google Analytics, Facebook Pixel, or any third-party trackers that monitor your behavior.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">4. Contact</h3>
          <p>If you have questions, email us at <a href="mailto:privacy@onetool.co" className="text-indigo-600 underline">privacy@onetool.co</a>.</p>
       </div>
    </div>
  );
}
TS_END

# =========================================================
# 4. TERMS OF SERVICE PAGE
# =========================================================
echo "âš–ï¸ Creating Terms of Service..."
cat > app/terms/page.tsx << 'TS_END'
"use client";
import React from "react";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-16 space-y-8">
       <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
       <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
          <p>By accessing One Tool, you agree to these terms.</p>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. Usage License</h3>
          <p>One Tool is free to use for personal and commercial purposes. You may not reverse engineer or resell the application source code without permission.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Disclaimer</h3>
          <p>The tools provided (Financial Calculators, Crypto Generators) are for informational purposes only. One Tool is not responsible for financial losses or data errors resulting from use of the software.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. "As Is" Basis</h3>
          <p>The software is provided "as is," without warranty of any kind, express or implied.</p>
       </div>
    </div>
  );
}
TS_END

# =========================================================
# 5. ABOUT PAGE
# =========================================================
echo "í³– Creating About Page..."
cat > app/about/page.tsx << 'TS_END'
"use client";
import React from "react";
import { Shield, Zap, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto p-8 md:p-16 space-y-16">
       <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white">The One Tool Mission</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">We are building the world's most private, fast, and capable digital utility belt.</p>
       </div>

       <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 mb-4"><Shield size={24}/></div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy First</h3>
             <p className="text-slate-500 leading-relaxed">We believe your financial data and developer secrets should never leave your device. That's why One Tool runs 100% offline.</p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 mb-4"><Zap size={24}/></div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Blazing Fast</h3>
             <p className="text-slate-500 leading-relaxed">No loading spinners. No server round-trips. Our tools calculate instantly using the power of your own device.</p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4"><Globe size={24}/></div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Accessible</h3>
             <p className="text-slate-500 leading-relaxed">Built with high-contrast modes, screen reader support, and responsive design for everyone, everywhere.</p>
          </div>
       </div>
    </div>
  );
}
TS_END

echo "âœ… Trust Layer Installed. You are ready for the public."
