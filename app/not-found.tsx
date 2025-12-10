import Link from 'next/link';
import { Home, AlertTriangle } from 'lucide-react';

// FIX: This line prevents the "useSearchParams" build error
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F111A] text-white p-4">
      <div className="bg-[#1C1F2E] p-8 rounded-2xl border border-white/5 text-center max-w-md shadow-2xl">
        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all"
        >
          <Home size={18} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
