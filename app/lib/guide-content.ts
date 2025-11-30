import { ReactNode } from "react";

// Matches SmartAssistant.tsx expectations
export interface GuideData {
  title: string;
  status: "Live" | "In Progress" | "Backlog";
  desc: string;        
  steps: string[];     
  tips: string[];      
  shortcuts?: { action: string; key: string }[]; 
}

export const GUIDE_CONTENT: Record<string, GuideData> = {
  "/tools/finance/smart-budget": {
    title: "Budgeting 101",
    status: "Live",
    desc: "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings. Track every expense to identify leaks.",
    steps: ["Calculate your total monthly income", "Categorize your fixed and variable expenses", "Set limits for discretionary spending"],
    tips: ["Use the 50/30/20 rule as a baseline", "Review your budget weekly, not just monthly"]
  },
  "/tools/finance/smart-loan": {
    title: "Amortization Strategy",
    status: "Live",
    desc: "Paying even one extra EMI per year reduces your tenure significantly. Interest is front-loaded in early years.",
    steps: ["Enter your principal loan amount", "Input your annual interest rate", "Set the loan tenure in years"],
    tips: ["Making one extra payment a year can shave years off your loan", "Refinance if rates drop by more than 1%"]
  },
  "/tools/finance/smart-debt": {
    title: "Payoff Strategies",
    status: "Live",
    desc: "Avalanche (High Interest) saves the most money. Snowball (Low Balance) builds motivation quickly.",
    steps: ["List all debts by interest rate and balance", "Choose Avalanche or Snowball method", "Automate minimum payments for all debts"],
    tips: ["Focus on high-interest debt first (Avalanche method)", "Consolidate debts if you can get a lower rate"]
  },
  "/tools/finance/smart-net-worth": {
    title: "Asset Allocation",
    status: "Live",
    desc: "Assets put money in your pocket (Stocks, Real Estate). Liabilities take money out (Loans, Credit Card debt).",
    steps: ["List all liquid assets (cash, savings)", "List investment assets", "Subtract all liabilities"],
    tips: ["Update your net worth statement quarterly", "Focus on increasing income-generating assets"]
  },
  "/tools/developer/smart-sql": {
    title: "SQL Best Practices",
    status: "Live",
    desc: "Always use uppercase for keywords (SELECT, FROM). Indent nested queries for readability.",
    steps: ["Write your query using standard keywords", "Format with proper indentation", "Test with a limit clause first"],
    tips: ["Avoid SELECT * in production", "Index columns used in WHERE clauses"]
  },
  "/tools/developer/smart-regex": {
    title: "Regex Cheat Sheet",
    status: "Live",
    desc: "^ Start, $ End, . Any, * 0+, + 1+, ? 0-1, \\d Digit, \\w Word. Use flags: g (global), i (insensitive).",
    steps: ["Define the pattern you want to match", "Choose appropriate flags (g, i, m)", "Test against sample strings"],
    tips: ["Use non-capturing groups (?:...) when possible", "Be careful with greedy quantifiers"]
  },
  "/tools/documents/pdf/merge": {
    title: "PDF Management",
    status: "Live",
    desc: "Drag and drop files to reorder them before merging. The top file becomes the first page.",
    steps: ["Upload multiple PDF files", "Drag to reorder pages", "Click Merge to download"],
    tips: ["Compress files before merging if they are large", "Ensure all files are not password protected"]
  },
  "/tools/health/smart-bmi": {
    title: "BMI Metrics",
    status: "In Progress",
    desc: "Documentation for health metrics is currently being written by our medical team.",
    steps: [],
    tips: []
  }
};

export const DEFAULT_GUIDE: GuideData = {
  title: "Context Guide",
  status: "Backlog",
  desc: "No specific documentation available for this view yet.",
  steps: [],
  tips: []
};
