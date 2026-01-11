#!/bin/bash

echo "âš–ï¸  Installing Enterprise Compliance & Recovery Systems..."

# 1. Custom 404 Page (Smart Error Recovery)
cat > app/not-found.tsx << '404_EOF'
"use client";

import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col items-center justify-center p-4 text-center">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-full shadow-xl mb-8 animate-bounce">
        <FileQuestion size={64} className="text-indigo-500" />
      </div>
      
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
        404
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-6">
        Page Not Found
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 leading-relaxed">
        The tool or page you are looking for doesn't exist or has been moved. 
        Try searching for it or head back to the dashboard.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button size="lg" icon={<Home size={18} />}>
            Back to Home
          </Button>
        </Link>
        {/* Only works if GlobalCommand is mounted, otherwise just visual */}
        <Button 
          variant="secondary" 
          size="lg" 
          icon={<Search size={18} />}
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          Search Tools (Ctrl+K)
        </Button>
      </div>
    </div>
  );
}
404_EOF

# 2. Privacy Policy Page
mkdir -p app/privacy
cat > app/privacy/page.tsx << 'PRIVACY_EOF'
import { Metadata } from "next";
import ToolShell from "@/app/components/layout/ToolShell";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | One Tool Enterprise",
  robots: "noindex",
};

export default function PrivacyPage() {
  return (
    <ToolShell
      title="Privacy Policy"
      description="Last Updated: December 2024"
      category="Legal"
      icon={<Shield className="w-5 h-5 text-emerald-500" />}
    >
      <div className="prose dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3>1. Data Privacy Summary</h3>
        <p>
          <strong>One Tool Enterprise</strong> operates on a "Local-First" architecture. 
          We do not store, process, or transmit your input data (files, text, financial numbers) to any server.
          All processing happens 100% within your web browser.
        </p>

        <h3>2. Analytics</h3>
        <p>
          We use privacy-friendly analytics (Google Analytics 4) to track page views and tool popularity. 
          This data is anonymized and does not contain personal inputs.
        </p>

        <h3>3. Local Storage</h3>
        <p>
          Some tools (Smart Budget, Todo, Settings) save data to your browser's <code>localStorage</code> 
          for your convenience. You can clear this at any time by clearing your browser cache.
        </p>

        <h3>4. Third-Party Services</h3>
        <p>
          We rely on Vercel for hosting. No other third-party trackers are installed.
        </p>

        <h3>5. Contact</h3>
        <p>
          For privacy concerns, email us at <a href="mailto:support@onetool.co" className="text-indigo-600">support@onetool.co</a>.
        </p>
      </div>
    </ToolShell>
  );
}
PRIVACY_EOF

# 3. Terms of Service Page
mkdir -p app/terms
cat > app/terms/page.tsx << 'TERMS_EOF'
import { Metadata } from "next";
import ToolShell from "@/app/components/layout/ToolShell";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | One Tool Enterprise",
  robots: "noindex",
};

export default function TermsPage() {
  return (
    <ToolShell
      title="Terms of Service"
      description="Last Updated: December 2024"
      category="Legal"
      icon={<FileText className="w-5 h-5 text-blue-500" />}
    >
      <div className="prose dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing One Tool, you agree to be bound by these Terms of Service. If you do not agree, please do not use our tools.
        </p>

        <h3>2. Usage License</h3>
        <p>
          One Tool is free for personal and commercial use. You may not reverse engineer, scrape, or resell the platform itself.
        </p>

        <h3>3. Disclaimer</h3>
        <p>
          The tools are provided "as is". While we strive for accuracy (especially in Finance/Math tools), 
          we are not liable for any errors, financial losses, or data loss resulting from the use of this software.
        </p>

        <h3>4. Changes</h3>
        <p>
          We reserve the right to modify these terms at any time. Continued use constitutes acceptance of new terms.
        </p>
      </div>
    </ToolShell>
  );
}
TERMS_EOF

# 4. Dynamic Sitemap Generator
# This automatically lists ALL your tools for Google.
cat > app/sitemap.ts << 'SITEMAP_EOF'
import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/app/lib/tools-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://onetool.co.in';

  // 1. Static Pages
  const staticPages = [
    '',
    '/privacy',
    '/terms',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  // 2. Tool Pages (High Priority)
  const toolPages = ALL_TOOLS.map(tool => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, // High priority for tools
  }));

  // 3. Category Pages
  const categories = Array.from(new Set(ALL_TOOLS.map(t => t.category.toLowerCase())));
  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/tools/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...toolPages, ...categoryPages];
}
SITEMAP_EOF

echo "âœ… Compliance Pack Installed."
echo "í±‰ 404, Privacy, Terms, and Sitemap are now live locally."
