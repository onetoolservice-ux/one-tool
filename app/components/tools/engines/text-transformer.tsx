"use client";
import React, { useState } from 'react';
import { Type } from 'lucide-react';
import { Textarea, Button, CopyButton } from '@/app/components/shared';

export const TextTransformer = ({ toolId, title }: { toolId: string, title: string }) => {
  const [input, setInput] = useState("");
  
  const transform = (type: string) => {
    switch(type) {
      case 'upper': return input.toUpperCase();
      case 'lower': return input.toLowerCase();
      case 'title': return input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      case 'camel': return input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
      case 'snake': return input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || input;
      case 'kebab': return input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || input;
      default: return input;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
          <Type className="text-teal-600"/> {title}
       </h2>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[65vh]">
          {/* INPUT */}
          <div className="flex flex-col h-full">
             <Textarea
               label="Input"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               rows={12}
               placeholder="Type or paste your text here..."
               className="flex-1"
             />
          </div>
          
          {/* CONTROLS */}
          <div className="flex flex-col gap-4">
             <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">Transforms</label>
             <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(transform('upper'))}
                  className="hover:border-teal-500 hover:text-teal-600"
                >
                  UPPERCASE
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(transform('lower'))}
                  className="hover:border-teal-500 hover:text-teal-600"
                >
                  lowercase
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(transform('title'))}
                  className="hover:border-teal-500 hover:text-teal-600"
                >
                  Title Case
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(transform('camel'))}
                  className="hover:border-teal-500 hover:text-teal-600"
                >
                  camelCase
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(transform('snake'))}
                  className="hover:border-teal-500 hover:text-teal-600"
                >
                  snake_case
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(transform('kebab'))}
                  className="hover:border-teal-500 hover:text-teal-600"
                >
                  kebab-case
                </Button>
             </div>
             
             <div className="mt-auto p-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                   <p className="text-xs font-bold uppercase text-slate-400 mb-0.5">Character Count</p>
                   <p className="text-xl font-black">{input.length}</p>
                </div>
                <CopyButton
                  text={input}
                  variant="button"
                  size="sm"
                  successMessage="Text copied to clipboard"
                  disabled={!input}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                />
             </div>
          </div>
       </div>
    </div>
  );
};