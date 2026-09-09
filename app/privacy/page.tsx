import { Metadata } from "next";
import ToolShell from "@/app/components/layout/ToolShell";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | One Tool Enterprise",
  robots: "noindex",
};

export default function PrivacyPage() {
  return (
    <ToolShell>
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-[#638c80]" />
          <span className="text-sm text-slate-400">Legal</span>
        </div>
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-slate-400">Last Updated: December 2024</p>
      </div>
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
