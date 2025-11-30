import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-in fade-in duration-500">
      <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
        <FileQuestion size={64} className="text-slate-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-slate-500 max-w-md mb-8 text-lg">
        We couldn't find the tool you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
