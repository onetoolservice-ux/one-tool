import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">One Tool</span>
          <span className="text-sm text-slate-400">|</span>
          <span className="text-sm text-slate-500">&copy; {year} Local-First Software.</span>
        </div>

        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/about" className="hover:text-[rgb(117,163,163)] transition-colors">About</Link>
          <Link href="/learn" className="hover:text-[rgb(117,163,163)] transition-colors">Learn</Link>
          <Link href="/tools" className="hover:text-[rgb(117,163,163)] transition-colors">Tools</Link>
        </div>

      </div>
    </footer>
  );
}
