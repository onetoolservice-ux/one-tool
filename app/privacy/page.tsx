"use client";
import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-16 space-y-8">
       <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
       <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
          <p className="lead text-xl">At One Tool, we believe your data belongs to you. Period.</p>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. No Server Tracking</h3>
          <p>One Tool operates as a <strong>Client-Side Application (PWA)</strong>. When you use tools like "Smart Budget" or "Password Generator," the logic runs entirely inside your browser. No data is sent to our servers.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Local Storage</h3>
          <p>All user data (budgets, notes, settings) is stored in your device's <code>localStorage</code>. This means if you clear your browser cache, your data is removed. We do not have a copy.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Analytics</h3>
          <p>We do not use Google Analytics, Facebook Pixel, or any third-party trackers that monitor your behavior.</p>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">4. Contact</h3>
          <p>If you have questions, email us at <a href="mailto:privacy@onetool.co" className="text-indigo-600 underline">privacy@onetool.co</a>.</p>
       </div>
    </div>
  );
}
