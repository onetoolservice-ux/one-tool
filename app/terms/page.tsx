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
