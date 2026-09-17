/**
 * Rule-based help assistant
 *
 * Answers "what is this / how do I..." questions instantly from data that
 * already exists in the app (tool descriptions + helpConfig steps) plus a
 * small curated FAQ list — no AI call, no cost, no network round trip.
 * Falls back to the human Feedback form only when nothing matches well.
 */
import { fuzzySearch, type SearchItem } from '@/app/lib/search-utils';
import { ALL_TOOLS, type Tool, type ToolHelpConfig } from '@/app/lib/tools-data';
import { categoryToSpaceHref } from '@/app/lib/space-config';

export interface HelpAnswer {
  id: string;
  title: string;
  description: string;
  steps?: { title: string; description: string }[];
  ctaLabel?: string;
  ctaHref?: string;
}

// ── Curated FAQ — evergreen questions that aren't tied to one tool ─────────
interface FaqEntry extends SearchItem {
  answer: HelpAnswer;
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'faq-data-safety',
    title: 'Is my data safe? Where does my bank statement go?',
    category: 'privacy security data safe store upload server',
    answer: {
      id: 'faq-data-safety',
      title: 'Is my data safe?',
      description: 'Yes. Statements and financial data are processed entirely in your browser — nothing is uploaded to a server. See the full privacy policy for details.',
      ctaLabel: 'Read privacy policy',
      ctaHref: '/privacy',
    },
  },
  {
    id: 'faq-free',
    title: 'Is One Tool free? Do I need to pay?',
    category: 'free pricing cost paid subscription plan',
    answer: {
      id: 'faq-free',
      title: 'Is it free?',
      description: 'Yes, One Tool is free to use for both My Finances and My Business.',
    },
  },
  {
    id: 'faq-import',
    title: 'How do I import my bank statement?',
    category: 'import upload csv statement bank connect account',
    answer: {
      id: 'faq-import',
      title: 'How do I import a statement?',
      description: 'Open My Finances → Import Statements, add an account, then upload a CSV or Excel file exported from your bank\'s net banking portal. Everything else (transactions, budgets, tax) is built from that one import.',
      ctaLabel: 'Open Import Statements',
      ctaHref: '/my-finance/pf-bank-connect',
    },
  },
  {
    id: 'faq-workspace-diff',
    title: "What's the difference between My Finances and My Business?",
    category: 'difference workspace personal finance business',
    answer: {
      id: 'faq-workspace-diff',
      title: 'My Finances vs My Business',
      description: 'My Finances is for your own money — transactions, budgets, investments, tax. My Business is for running a business — invoices, parties, inventory, GST. They\'re separate workspaces with separate data.',
    },
  },
  {
    id: 'faq-signin',
    title: 'Do I need to sign in to use the tools?',
    category: 'sign in login account required guest',
    answer: {
      id: 'faq-signin',
      title: 'Do I need to sign in?',
      description: 'Most tools work as a guest. Signing in lets your data sync across devices and be saved to your account instead of just this browser.',
    },
  },
  {
    id: 'faq-report-bug',
    title: 'How do I report a bug or suggest a feature?',
    category: 'bug report suggest feature request contact write',
    answer: {
      id: 'faq-report-bug',
      title: 'How do I report a bug or suggestion?',
      description: 'Use the "Still need help? Write to us" option below — pick the page it\'s about, describe what happened, and attach a screenshot if you have one.',
    },
  },
];

// ── Page-level help (from tools-data.tsx helpConfig, with a sane fallback) ─
export function getPageHelp(pageHref: string): HelpAnswer | null {
  if (pageHref === '/' || pageHref === 'other') return null;
  if (pageHref === '/about') {
    return {
      id: 'page-about',
      title: 'About One Tool',
      description: 'One Tool is two connected workspaces — My Finances and My Business — built on one statement import.',
      ctaLabel: 'Open About',
      ctaHref: '/about',
    };
  }

  const tool = ALL_TOOLS.find(t => `${categoryToSpaceHref(t.category)}/${t.id}` === pageHref);
  if (!tool) return null;

  const config: ToolHelpConfig = tool.helpConfig ?? { title: tool.name, description: tool.desc, steps: [] };
  return {
    id: `page-${tool.id}`,
    title: config.title,
    description: config.description,
    steps: config.steps,
  };
}

// ── Free-text search across FAQ + every tool's name/description ────────────
function toolToHelpAnswer(tool: Tool): HelpAnswer {
  const config = tool.helpConfig;
  return {
    id: `tool-${tool.id}`,
    title: tool.name,
    description: config?.description ?? tool.desc,
    steps: config?.steps,
    ctaLabel: `Open ${tool.name}`,
    ctaHref: `${categoryToSpaceHref(tool.category)}/${tool.id}`,
  };
}

const TOOL_SEARCH_ITEMS: (SearchItem & { tool: Tool })[] = ALL_TOOLS.map(tool => ({
  id: tool.id,
  title: tool.name,
  category: `${tool.category} ${tool.desc}`,
  tool,
}));

const MIN_QUERY_LENGTH = 3;

export function searchHelp(query: string, maxResults = 4): HelpAnswer[] {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];

  const faqMatches = fuzzySearch(FAQ_ENTRIES, q, ['title', 'category']).map(f => f.answer);
  const toolMatches = fuzzySearch(TOOL_SEARCH_ITEMS, q, ['title', 'category']).map(t => toolToHelpAnswer(t.tool));

  // FAQ answers first (evergreen, higher intent-match), then tool matches, de-duped
  const seen = new Set<string>();
  const merged: HelpAnswer[] = [];
  for (const answer of [...faqMatches, ...toolMatches]) {
    if (seen.has(answer.id)) continue;
    seen.add(answer.id);
    merged.push(answer);
    if (merged.length >= maxResults) break;
  }
  return merged;
}
