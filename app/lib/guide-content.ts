import { ReactNode } from "react";

interface GuideData {
  title: string;
  content: string | ReactNode;
  status: "Live" | "In Progress" | "Backlog";
}

export const GUIDE_CONTENT: Record<string, GuideData> = {
  // --- FINANCE ---
  "/tools/finance/smart-budget": {
    title: "Budgeting 101",
    status: "Live",
    content: "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings. Track every expense to identify leaks."
  },
  "/tools/finance/smart-loan": {
    title: "Amortization Strategy",
    status: "Live",
    content: "Paying even one extra EMI per year reduces your tenure significantly. Interest is front-loaded in early years."
  },
  "/tools/finance/smart-debt": {
    title: "Payoff Strategies",
    status: "Live",
    content: "Avalanche (High Interest) saves the most money. Snowball (Low Balance) builds motivation quickly."
  },
  "/tools/finance/smart-net-worth": {
    title: "Asset Allocation",
    status: "Live",
    content: "Assets put money in your pocket (Stocks, Real Estate). Liabilities take money out (Loans, Credit Card debt)."
  },

  // --- DEVELOPER ---
  "/tools/developer/smart-sql": {
    title: "SQL Best Practices",
    status: "Live",
    content: "Always use uppercase for keywords (SELECT, FROM). Indent nested queries for readability."
  },
  "/tools/developer/smart-regex": {
    title: "Regex Cheat Sheet",
    status: "Live",
    content: "^ Start, $ End, . Any, * 0+, + 1+, ? 0-1, \\d Digit, \\w Word. Use flags: g (global), i (insensitive)."
  },

  // --- DOCUMENTS ---
  "/tools/documents/pdf/merge": {
    title: "PDF Management",
    status: "Live",
    content: "Drag and drop files to reorder them before merging. The top file becomes the first page."
  },

  // --- FALLBACKS (Examples of In Progress) ---
  "/tools/health/smart-bmi": {
    title: "BMI Metrics",
    status: "In Progress",
    content: "Documentation for health metrics is currently being written by our medical team."
  }
};

export const DEFAULT_GUIDE: GuideData = {
  title: "Context Guide",
  status: "Backlog",
  content: "No specific documentation available for this view yet."
};
