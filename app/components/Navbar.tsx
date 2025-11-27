"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import MegaMenu from "./navigation/MegaMenu";
import { ChevronDown } from "lucide-react"; // Install: npm install lucide-react

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-xs tracking-wider">OT</span>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">One Tool</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              Home
            </Link>
            
            {/* Tools Dropdown */}
            <div ref={ref} className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors outline-none ${
                  open ? "text-teal-600" : "text-slate-600 hover:text-teal-600"
                }`}
              >
                Tools <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 pt-2">
                   {/* The MegaMenu sits inside this wrapper for positioning */}
                   <MegaMenu />
                </div>
              )}
            </div>

            <Link href="/ai" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              AI Tools
            </Link>
            <Link href="/learn" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              Learn
            </Link>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-medium text-slate-500 hover:text-slate-900">
              Log in
            </Link>
            <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}