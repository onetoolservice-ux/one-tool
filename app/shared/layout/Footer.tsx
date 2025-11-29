import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line dark:border-slate-700 dark:border-slate-800 bg-surface dark:bg-slate-800 dark:bg-surface mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2">
          <span className="font-bold text-main dark:text-slate-300">One Tool</span>
          <span className="text-sm text-muted/70">|</span>
          <span className="text-sm text-muted dark:text-muted dark:text-muted dark:text-muted">&copy; {year} Local-First Software.</span>
        </div>

        <div className="flex gap-6 text-sm font-medium text-muted dark:text-muted/70 dark:text-muted/70">
          <Link href="/about" className="hover:text-[rgb(117,163,163)] transition-colors">About</Link>
          <Link href="/learn" className="hover:text-[rgb(117,163,163)] transition-colors">Learn</Link>
          <Link href="/tools" className="hover:text-[rgb(117,163,163)] transition-colors">Tools</Link>
        </div>

      </div>
    </footer>
  );
}
