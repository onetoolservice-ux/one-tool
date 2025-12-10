import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Zap, Globe } from 'lucide-react';

// FIX: This prevents the "useSearchParams" build error
export const dynamic = 'force-dynamic';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F111A] text-white font-sans">
      
      {/* Header */}
      <header className="border-b border-white/5 p-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">About One Tool Solutions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-8 py-16">
        
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            One Platform. Infinite Tools.
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            We believe you shouldn't need a dozen different subscriptions to manage your digital life. 
            One Tool Solutions is your all-in-one operating system for productivity, utilities, and developer tools.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-6 bg-[#1C1F2E] rounded-2xl border border-white/5">
            <Zap className="text-yellow-400 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-2">Instant Utilities</h3>
            <p className="text-gray-400 text-sm">Converters, calculators, and generators that load instantly and work offline.</p>
          </div>
          <div className="p-6 bg-[#1C1F2E] rounded-2xl border border-white/5">
            <Globe className="text-blue-400 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-2">Life OS</h3>
            <p className="text-gray-400 text-sm">A complete personal productivity suite to manage your daily tasks and long-term goals.</p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 p-8 rounded-3xl border border-blue-500/20">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
              <span className="text-gray-300">Eliminate context switching between different apps.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
              <span className="text-gray-300">Provide privacy-focused, client-side tools that don't steal your data.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={18} />
              <span className="text-gray-300">Build a unified interface for the modern digital worker.</span>
            </li>
          </ul>
        </div>

      </main>
    </div>
  );
}
