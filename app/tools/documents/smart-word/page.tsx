import { Metadata } from "next";
import WordClient from "./WordClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Smart Word Editor - Online Rich Text & PDF Writer | One Tool",
  description: "A distraction-free online word processor that saves your work automatically. Export to PDF, copy as text, and format easily. No login required.",
  keywords: ["online word editor", "text editor", "free word processor", "write online", "note taking app"],
  alternates: {
    canonical: "https://onetool.co.in/tools/documents/smart-word",
  }
};

export default function SmartWordPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 min-h-screen">
      <ToolSchema 
        name="Smart Word" 
        description="Free online rich text editor with auto-save and PDF export capabilities."
        path="/tools/documents/smart-word"
        category="WebApplication"
      />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <Link href="/tools/documents" className="hover:text-blue-600 transition">Documents</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Smart Word</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Smart <span className="text-blue-600">Word</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
          A secure, distraction-free writing environment. Your documents are stored locally in your browser.
        </p>
      </div>

      <WordClient />
    </div>
  );
}
