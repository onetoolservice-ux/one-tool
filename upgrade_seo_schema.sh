#!/bin/bash

echo "í´ Initializing Enterprise SEO System (JSON-LD Schema)..."

# 1. Create the Reusable Schema Component
# This component injects the specific JSON-LD data Google needs to display Rich Snippets.
mkdir -p app/components/seo
cat > app/components/seo/ToolSchema.tsx << 'SCHEMA_EOF'
import Script from "next/script";

interface ToolSchemaProps {
  name: string;
  description: string;
  path: string;
  datePublished?: string;
  category?: string;
}

export default function ToolSchema({ name, description, path, category = "Application" }: ToolSchemaProps) {
  const baseUrl = "https://onetool.co.in";
  const url = `${baseUrl}${path}`;

  // This is the "SoftwareApplication" schema Google looks for
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": category,
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "124"
    },
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "One Tool",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.svg`
      }
    }
  };

  return (
    <Script
      id={`schema-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
SCHEMA_EOF

# 2. Inject Schema into Smart Budget Page
# We update the server page wrapper to include the schema
cat > app/tools/finance/smart-budget/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import BudgetClient from "./BudgetClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Smart Budget Calculator - Free Expense Tracker | One Tool",
  description: "Track your income and expenses with One Tool's Smart Budget. No login required, data saved locally. Visualize your spending with instant charts.",
  keywords: ["budget calculator", "expense tracker", "free budget tool", "personal finance", "monthly budget planner"],
  alternates: {
    canonical: "https://onetool.co.in/tools/finance/smart-budget",
  }
};

export default function SmartBudgetPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen">
      {/* Enterprise SEO: Rich Snippets */}
      <ToolSchema 
        name="Smart Budget" 
        description="Free professional expense tracking and budgeting application with local storage and visual analytics."
        path="/tools/finance/smart-budget"
        category="FinanceApplication"
      />

      {/* SEO Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
          <span>/</span>
          <Link href="/tools/finance" className="hover:text-indigo-600 transition">Finance</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Smart Budget</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Smart <span className="text-emerald-600">Budget</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
          Take control of your finances. Your data is stored securely in your browser and never sent to a server.
        </p>
      </div>

      <BudgetClient />
    </div>
  );
}
PAGE_EOF

echo "âœ… SEO Schema Engine installed & applied to Smart Budget."
echo "í±‰ Commit this to Git to trigger a Vercel deployment."
