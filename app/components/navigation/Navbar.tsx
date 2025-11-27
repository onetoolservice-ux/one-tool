"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[rgb(117,163,163)] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm tracking-wider">OT</span>
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">
              One Tool
            </span>
          </Link>

          {/* Desktop Nav - DIRECT LINKS (No Dropdown) */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/" active={pathname === "/"}>Home</NavLink>
            <NavLink href="/tools" active={pathname.startsWith("/tools")}>Tools</NavLink>
            <NavLink href="/ai" active={pathname === "/ai"}>AI</NavLink>
            <NavLink href="/learn" active={pathname === "/learn"}>Learn</NavLink>
            <NavLink href="/about" active={pathname === "/about"}>About</NavLink>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
             <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900">Log in</Link>
             <Link href="/tools" className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
               Dashboard
             </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-xl">
          <div className="p-4 space-y-2">
            <MobileLink href="/" onClick={() => setIsMenuOpen(false)}>Home</MobileLink>
            <MobileLink href="/tools" onClick={() => setIsMenuOpen(false)}>All Tools</MobileLink>
            <MobileLink href="/ai" onClick={() => setIsMenuOpen(false)}>AI Tools</MobileLink>
            <MobileLink href="/learn" onClick={() => setIsMenuOpen(false)}>Learn</MobileLink>
            <MobileLink href="/about" onClick={() => setIsMenuOpen(false)}>About</MobileLink>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`text-sm font-medium transition-colors duration-200 ${active ? "text-[rgb(117,163,163)]" : "text-slate-600 hover:text-slate-900"}`}>
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
      {children}
    </Link>
  );
}