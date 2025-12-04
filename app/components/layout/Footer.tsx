"use client";
import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Logo } from '@/app/components/layout/logo';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 font-bold tracking-tighter text-slate-900 dark:text-white text-sm">
              <Logo className="w-6 h-6" color="#0d9488" />
              <span className="text-teal-600">OneTool.</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-xs">The Enterprise OS for daily work.</p>
            <div className="flex gap-3 text-slate-400"><Github size={16}/><Twitter size={16}/><Linkedin size={16}/></div>
          </div>
          <div><h3 className="font-bold mb-3 text-[10px] uppercase">Product</h3><ul className="space-y-2 text-slate-500"><li><Link href="/?cat=Business">Business</Link></li><li><Link href="/?cat=Finance">Finance</Link></li><li><Link href="/?cat=Developer">Dev</Link></li></ul></div>
          <div><h3 className="font-bold mb-3 text-[10px] uppercase">Resources</h3><ul className="space-y-2 text-slate-500"><li>Docs</li><li>API</li><li>Status</li></ul></div>
          <div><h3 className="font-bold mb-3 text-[10px] uppercase">Contact</h3><ul className="space-y-2 text-slate-500"><li>support@onetool.com</li><li>Bangalore, India</li></ul></div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex justify-between items-center text-[10px] text-slate-400"><p>© 2025 OneTool Enterprise.</p><p>Made with <Heart size={10} className="text-rose-500 inline"/> in India</p></div>
      </div>
    </footer>
  );
};
