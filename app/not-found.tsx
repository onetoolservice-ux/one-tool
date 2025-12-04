import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120] text-center p-4">
      <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
         <FileQuestion size={40} className="text-slate-500" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404</h1>
      <p className="text-slate-500 mb-8">Page not found. It might have been moved or deleted.</p>
      <Link 
        href="/" 
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
