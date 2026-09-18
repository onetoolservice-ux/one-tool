import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ShieldCheck, Database, Cookie, Share2, Lock, Trash2, Mail,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How One Tool handles your data — bank statements processed in your browser, what we store locally, and what we never send to a server.',
};

const SECTIONS = [
  {
    id: 'what-we-collect',
    icon: Database,
    title: 'What we collect',
    body: (
      <>
        <p>
          One Tool is built local-first. When you import a bank statement or add data to <strong>My Finances</strong> or <strong>My Business</strong>,
          it is parsed and stored on your own device — in your browser's local storage — not uploaded to our servers.
          We never see your transactions, balances, invoices, or party details.
        </p>
        <p>
          The only data that reaches us is anonymous usage analytics (which pages and tools are opened, how often) and,
          if you choose to write in, whatever you include in a feedback or support message.
        </p>
      </>
    ),
  },
  {
    id: 'how-it-stays-on-device',
    icon: Lock,
    title: 'How your financial data stays on your device',
    body: (
      <>
        <p>
          Statement files (PDF, CSV, Excel) are parsed entirely in your browser using client-side code. The parsed transactions,
          budgets, investments, and business records are saved to your browser's <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[13px]">localStorage</code> /
          <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[13px]"> IndexedDB</code>, scoped to this device and browser.
        </p>
        <p>
          This means: your data doesn't sync across devices unless you export and re-import it yourself, and it is only as
          safe as the device you're using — anyone with access to your browser profile can see it. Uninstalling the app doesn't
          apply here since there's nothing installed; clearing your browser's site data for onetool removes everything.
        </p>
      </>
    ),
  },
  {
    id: 'cookies-analytics',
    icon: Cookie,
    title: 'Cookies and analytics',
    body: (
      <>
        <p>
          We use privacy-friendly analytics to understand which tools are used and where people run into friction — page views,
          session duration, and broad device/browser type. This data is aggregated and anonymized; it does not contain your
          financial figures, statement contents, or anything you type into a tool.
        </p>
        <p>
          A small number of functional cookies may be set to remember preferences like theme (light/dark) and which workspace
          you last opened. You can block or clear cookies from your browser settings at any time without losing access to the app.
        </p>
      </>
    ),
  },
  {
    id: 'third-parties',
    icon: Share2,
    title: 'Third-party services',
    body: (
      <>
        <p>We keep our vendor list short on purpose:</p>
        <ul>
          <li><strong>Vercel</strong> — hosts the app and serves static assets. Standard server logs (IP, request path, timestamp) are generated for uptime and security, in line with Vercel's own privacy policy.</li>
          <li><strong>Analytics provider</strong> — aggregated, anonymized usage metrics only, as described above.</li>
        </ul>
        <p>
          We do not sell, rent, or share your data with advertisers, data brokers, or any third party for marketing purposes —
          because for financial and business data, there is nothing of yours on our servers to share in the first place.
        </p>
      </>
    ),
  },
  {
    id: 'your-control',
    icon: Trash2,
    title: 'Your control over your data',
    body: (
      <>
        <p>
          Since your financial and business data lives in your browser, you are always in control of it:
        </p>
        <ul>
          <li>Export your data from within My Finances / My Business at any time.</li>
          <li>Delete individual records directly in the app.</li>
          <li>Clear everything at once by clearing this site's data from your browser settings, or using "Reset workspace" inside the app if available.</li>
        </ul>
        <p>
          If you've sent us a support or feedback email, you can ask us to delete that correspondence by writing to the
          address below — we'll remove it from our inbox and any ticketing tool we use.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    icon: ShieldCheck,
    title: 'Changes to this policy',
    body: (
      <p>
        If our data practices change in a way that affects you — for example, if we ever introduce optional cloud sync —
        we will update this page and call out the change clearly before it takes effect. We won't move your data off-device
        silently.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="w-full">
      <section className="border-b border-slate-200 dark:border-white/5">
        <div className="w-full px-6 py-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ot-fin-accent)]">Legal</span>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Last updated: September 2026</p>
          <p className="mt-4 text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
            The short version: your bank statements, transactions, invoices, and everything else you enter into
            My Finances or My Business is processed and stored in your own browser. It never touches our servers.
          </p>
        </div>
      </section>

      <section className="w-full px-6 py-12 space-y-10">
        {SECTIONS.map(({ id, icon: Icon, title, body }, i) => (
          <div key={id} id={id} className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-6">
            <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-9 h-9 rounded-lg bg-[var(--ot-fin-accent)]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[var(--ot-fin-accent)]" />
              </div>
              <span className="text-xs font-mono text-slate-400 dark:text-gray-600">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
              <div className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-sm [&_code]:font-mono">
                {body}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="border-t border-slate-200 dark:border-white/5">
        <div className="w-full px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Questions about this policy?</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Write to us at{' '}
                <a href="mailto:support@onetool.com" className="text-[var(--ot-fin-accent)] font-medium hover:underline">
                  support@onetool.com
                </a>
                .
              </p>
            </div>
          </div>
          <Link
            href="/terms"
            className="text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-[var(--ot-fin-accent)] whitespace-nowrap"
          >
            Read our terms of service →
          </Link>
        </div>
      </section>
    </div>
  );
}
