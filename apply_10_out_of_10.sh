#!/bin/bash

echo "í²Ž Applying 10/10 Polish (Error Handling & Loading States)..."

# =========================================================
# 1. CUSTOM 404 PAGE (Not Found)
# =========================================================
echo "íº« Creating Branded 404 Page..."
cat > app/not-found.tsx << 'TS_END'
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
TS_END

# =========================================================
# 2. GLOBAL ERROR BOUNDARY (Crash Handler)
# =========================================================
echo "í»¡ï¸ Creating Global Error Boundary..."
cat > app/error.tsx << 'TS_END'
"use client"; // Error components must be Client Components
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
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
TS_END

# =========================================================
# 3. GLOBAL LOADING STATE (Skeleton)
# =========================================================
echo "â³ Creating Global Loading Spinner..."
cat > app/loading.tsx << 'TS_END'
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="text-indigo-600 animate-spin" />
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading OneTool...</p>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 4. OFFLINE FALLBACK (For PWA)
# =========================================================
echo "í³¡ Creating Offline Fallback..."
# This page shows up if the user is offline and hits a non-cached page
cat > app/offline.tsx << 'TS_END'
import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
        <WifiOff size={64} className="text-slate-400" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">You are Offline</h1>
      <p className="text-slate-500 max-w-md mb-8">
        Please check your internet connection. Don't worry, your local tools (Calculator, Budget, Notes) still work!
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all"
      >
        Go to My Tools
      </Link>
    </div>
  );
}
TS_END

echo "âœ… 10/10 Polish Applied. Edge cases covered."
