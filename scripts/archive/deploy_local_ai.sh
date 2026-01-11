#!/bin/bash

echo "í·  Initializing Neural Engine (Client-Side AI)..."

# 1. Install Transformers.js (The engine)
npm install @xenova/transformers

# 2. Create the AI Client Component
mkdir -p app/tools/ai/smart-analyze
cat > app/tools/ai/smart-analyze/AnalyzeClient.tsx << 'AI_EOF'
"use client";

import React, { useState, useEffect, useRef } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { BrainCircuit, Play, RotateCcw, Loader2, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

// Dynamic import for the worker to avoid SSR issues
// We will load the pipeline inside useEffect

export default function AnalyzeClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState("Ready to load AI model...");
  const workerRef = useRef<Worker | null>(null);

  // We use a Web Worker approach to keep the UI smooth
  useEffect(() => {
    if (!workerRef.current) {
      // Simple inline worker for demo purposes (in a real app, this would be a separate file)
      // But for direct client-side simplicity with transformers.js:
      // We will run it on the main thread for this specific lightweight task (Sentiment)
    }
  }, []);

  const analyzeSentiment = async () => {
    if (!input) return;
    setLoading(true);
    setModelStatus("Loading Neural Network (40MB)... First run takes a moment.");

    try {
      // Lazy load the library only when needed
      const { pipeline } = await import("@xenova/transformers");
      
      // Load the sentiment analysis model (DistilBERT)
      const classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      
      setModelStatus("Processing...");
      const output = await classifier(input);
      // Output format: [{ label: 'POSITIVE', score: 0.99 }]
      setResult(output[0]);
    } catch (error) {
      console.error(error);
      setModelStatus("Error loading model. Check connection.");
    }
    
    setLoading(false);
  };

  const getMoodColor = (label: string) => {
    if (label === 'POSITIVE') return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    if (label === 'NEGATIVE') return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800';
    return 'text-slate-500 bg-slate-50';
  };

  const getMoodIcon = (label: string) => {
    if (label === 'POSITIVE') return <ThumbsUp size={32} />;
    if (label === 'NEGATIVE') return <ThumbsDown size={32} />;
    return <Minus size={32} />;
  };

  return (
    <ToolShell 
      title="AI Sentiment Analyzer" 
      description="Analyze the emotional tone of any text using a local Neural Network. 100% Private." 
      category="AI" 
      icon={<BrainCircuit className="w-5 h-5 text-fuchsia-500" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Area */}
        <div className="space-y-4">
          <Card className="p-1">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-[300px] p-6 bg-transparent outline-none resize-none text-lg leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
              placeholder="Enter text here to analyze its sentiment (e.g. 'I absolutely loved this product!')..."
            />
          </Card>
          <div className="flex gap-3">
            <Button 
              onClick={analyzeSentiment} 
              isLoading={loading} 
              disabled={!input || loading}
              className="flex-1 py-4 text-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 border-none text-white shadow-lg shadow-fuchsia-500/25"
              icon={<Play size={20} fill="currentColor" />}
            >
              {loading ? "Thinking..." : "Analyze Sentiment"}
            </Button>
            <Button variant="secondary" onClick={() => { setInput(""); setResult(null); }} icon={<RotateCcw size={20} />}>
              Reset
            </Button>
          </div>
          {loading && <p className="text-xs text-center text-slate-400 animate-pulse">{modelStatus}</p>}
        </div>

        {/* Result Area */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
             {result ? (
               <div className="animate-in zoom-in-95 duration-500 relative z-10">
                 <div className={`w-24 h-24 mx-auto flex items-center justify-center rounded-full border-4 mb-6 shadow-xl ${getMoodColor(result.label)}`}>
                    {getMoodIcon(result.label)}
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                   {result.label}
                 </h2>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-mono font-bold">
                   CONFIDENCE: {(result.score * 100).toFixed(1)}%
                 </div>
                 
                 {/* Visual Bar */}
                 <div className="mt-8 w-64 mx-auto h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${result.label === 'POSITIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${result.score * 100}%` }}
                    />
                 </div>
               </div>
             ) : (
               <div className="text-slate-300 dark:text-slate-700">
                 <BrainCircuit size={64} className="mx-auto mb-4 opacity-50" />
                 <p className="text-lg font-medium">Ready to analyze</p>
                 <p className="text-sm opacity-75 mt-2 max-w-xs mx-auto">The AI model runs entirely in your browser. Your text is never uploaded.</p>
               </div>
             )}

             {/* Background Glow */}
             {result && (
               <div className={`absolute inset-0 opacity-10 blur-3xl -z-0 ${result.label === 'POSITIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
             )}
          </Card>
        </div>

      </div>
    </ToolShell>
  );
}
AI_EOF

# 3. Create Server Page
cat > app/tools/ai/smart-analyze/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import AnalyzeClient from "./AnalyzeClient";
import ToolSchema from "@/app/components/seo/ToolSchema";

export const metadata: Metadata = {
  title: "Free AI Sentiment Analyzer - Sentiment Analysis Online | One Tool",
  description: "Analyze text sentiment locally in your browser using AI. Detect positive or negative tone instantly. No server uploads, 100% private.",
  keywords: ["sentiment analysis", "ai text analyzer", "emotion detector", "nlp tool", "free ai tool"],
};

export default function Page() {
  return (
    <>
      <ToolSchema 
        name="AI Sentiment Analyzer" 
        description="Client-side AI sentiment analysis tool."
        path="/tools/ai/smart-analyze"
        category="WebApplication"
      />
      <AnalyzeClient />
    </>
  );
}
PAGE_EOF

echo "âœ… Neural Engine Deployed: Smart Analyze is live."
echo "í±‰ Run 'npm run dev'. Go to AI -> Smart Analyze. It will download the model on first run!"
