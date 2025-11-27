import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-ui-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-ui-text text-lg tracking-tight">
              One Tool Solutions
            </span>
            <p className="text-ui-textDim text-sm mt-1">
              Your digital swiss army knife.
            </p>
          </div>

          <div className="flex space-x-6 text-sm text-ui-textDim">
            <Link href="/privacy" className="hover:text-brand transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-brand transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-brand transition-colors">About</Link>
          </div>

        </div>
        <div className="mt-8 text-center text-xs text-ui-textDim border-t border-ui-border pt-8">
          &copy; {year} One Tool Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}