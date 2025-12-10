import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Bot, MessageSquare, Image as ImageIcon } from 'lucide-react';

// FIX: prevents the "useSearchParams" build error
export const dynamic = 'force-dynamic';

export default function AIPage() {
  return (
    <div className="min-h-screen bg-[#0F111A] text-white font-sans">
      
      {/* Header */}
      <header className="border-b border-white/5 p-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI Suite</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-8 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Artificial Intelligence Tools</h2>
          <p className="text-gray-400">Powerful AI utilities running directly in your browser.</p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Chat */}
          <Link href="/tools/ai/chat" className="group p-6 bg-[#1C1F2E] rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all">
            <div className="mb-4 w-12 h-12 bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1 group-hover:text-indigo-300">AI Chat</h3>
            <p className="text-sm text-gray-500">Conversational assistant for coding and writing.</p>
          </Link>

          {/* Card 2: Image Gen (Placeholder) */}
          <div className="group p-6 bg-[#1C1F2E] rounded-2xl border border-white/5 opacity-60 cursor-not-allowed">
            <div className="mb-4 w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-400">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1">Image Generator</h3>
            <p className="text-sm text-gray-500">Create visuals from text prompts. (Coming Soon)</p>
          </div>

          {/* Card 3: Code Helper (Placeholder) */}
          <div className="group p-6 bg-[#1C1F2E] rounded-2xl border border-white/5 opacity-60 cursor-not-allowed">
            <div className="mb-4 w-12 h-12 bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-400">
              <Bot size={24} />
            </div>
            <h3 className="text-lg font-bold mb-1">Code Assistant</h3>
            <p className="text-sm text-gray-500">Debug and refactor code snippets. (Coming Soon)</p>
          </div>

        </div>
      </main>
    </div>
  );
}
