"use client";
import React from "react";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-16 space-y-8">
       <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
       <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
          <p>By accessing One Tool, you agree to these terms.</p>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. Usage License</h3>
          <p>One Tool is free to use for personal and commercial purposes. You may not reverse engineer or resell the application source code without permission.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Disclaimer</h3>
          <p>The tools provided (Financial Calculators, Crypto Generators) are for informational purposes only. One Tool is not responsible for financial losses or data errors resulting from use of the software.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. "As Is" Basis</h3>
          <p>The software is provided "as is," without warranty of any kind, express or implied.</p>
       </div>
    </div>
  );
}
