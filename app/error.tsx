"use client"; // Error components must be Client Components
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "@/app/lib/utils/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-in fade-in duration-500">
      <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-full mb-6">
        <AlertTriangle size={64} className="text-rose-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">System Error</h1>
      <p className="text-slate-500 max-w-md mb-8">
        Something went wrong with this tool. Our automated systems have logged the issue.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all"
      >
        <RefreshCw size={18} /> Try Again
      </button>
    </div>
  );
}
