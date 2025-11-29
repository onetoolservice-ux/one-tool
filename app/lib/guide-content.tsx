import React from "react";
import { Lightbulb, BookOpen, CheckCircle2, AlertTriangle, Command, MousePointer, Code2, Terminal, Shield, Star, WifiOff, Zap } from "lucide-react";

export interface GuideData {
  title: string;
  desc: string;
  steps: string[];
  tips: string[];
  status: "Live" | "Draft";
}

export const GUIDE_CONTENT: Record<string, GuideData> = {
  // ==========================
  // 🏠 HOME / DASHBOARD
  // ==========================
  "/": {
    title: "One Tool Experience",
    desc: "Welcome to your privacy-first digital workspace. A unified suite of 45+ enterprise-grade tools that run entirely in your browser.",
    steps: [
      "Press 'Cmd+K' (or Ctrl+K) anywhere to launch the Command Menu.",
      "Click the 'Star' icon on any tool card to pin it to your Favorites.",
      "Use the 'Settings' gear to manage your local data or perform a factory reset."
    ],
    tips: [
      "100% Offline: Unplug your internet, and everything still works.",
      "Zero Data Collection: Your financial and developer data never leaves this device.",
      "PWA Ready: Install this app on your desktop or mobile for a native experience."
    ],
    status: "Live"
  },

  // ==========================
  // 💰 FINANCE
  // ==========================
  "/tools/finance/smart-budget": {
    title: "Smart Budget Manual",
    desc: "A professional General Ledger (G/L) with dual modes for personal tracking or enterprise accounting.",
    steps: [
      "Toggle 'Personal' vs 'Enterprise' mode in the header to switch complexity.",
      "In Enterprise Mode, track GL Accounts, Cost Centers, and Tax Codes.",
      "Use 'Smart Fill' to paste transaction text (e.g., 'Lunch $15') for auto-entry."
    ],
    tips: [
      "Personal Mode hides complex fields for a cleaner daily experience.",
      "Enterprise Mode exports are audit-ready for accountants."
    ],
    status: "Live"
  },
  "/tools/finance/smart-loan": {
    title: "Amortization Engine",
    desc: "Visualize how loan payments are split between Principal and Interest over time.",
    steps: ["Enter Loan Amount, Rate, and Tenure.", "View 'Schedule' for monthly breakdown.", "Check 'Projection' to see interest costs."],
    tips: ["Interest is front-loaded in early years.", "Pre-payments (even small ones) drastically reduce tenure."],
    status: "Live"
  },
  "/tools/finance/smart-debt": {
    title: "Debt Payoff Strategy",
    desc: "Calculate the mathematical fastest way to become debt-free.",
    steps: ["Add debts with their APR and Balance.", "Enter a 'Monthly Boost' amount.", "Toggle 'Avalanche' (Save Money) vs 'Snowball' (Motivation)."],
    tips: ["Avalanche method saves the most interest.", "Snowball method clears small debts first for quick wins."],
    status: "Live"
  },
  "/tools/finance/smart-net-worth": {
    title: "Net Worth Tracker",
    desc: "Your personal balance sheet. Track Assets (what you own) vs Liabilities (what you owe).",
    steps: ["List Assets (Home, Cash, Stocks).", "List Liabilities (Loans, Credit Cards).", "See your Real Net Worth instantly."],
    tips: ["A positive trend is more important than the current number.", "Focus on acquiring appreciation assets."],
    status: "Live"
  },
  "/tools/finance/smart-retirement": {
    title: "FIRE Projection",
    desc: "Financial Independence, Retire Early calculator.",
    steps: ["Input current age and savings.", "Set monthly investment & return rate.", "The chart shows if you will meet your goal."],
    tips: ["Compound interest needs time—start early.", "Account for inflation (usually ~6%) in your goals."],
    status: "Live"
  },
  "/tools/finance/smart-sip": {
    title: "Wealth Builder",
    desc: "Systematic Investment Plan (SIP) calculator for long-term growth.",
    steps: ["Enter monthly investment.", "Set expected annual return.", "View the power of compounding over 10+ years."],
    tips: ["Time in the market > Timing the market.", "Small, consistent investments beat sporadic large ones."],
    status: "Live"
  },

  // ==========================
  // 👨‍💻 DEVELOPER
  // ==========================
  "/tools/developer/smart-sql": {
    title: "SQL Formatter",
    desc: "Beautify and standardize complex SQL queries for better readability.",
    steps: ["Paste raw SQL code.", "Click 'Format' to auto-indent.", "Copy the clean code."],
    tips: ["Standardizes keywords (SELECT, FROM) to UPPERCASE.", "Helps debug syntax errors in large queries."],
    status: "Live"
  },
  "/tools/developer/smart-regex": {
    title: "Regex Tester",
    desc: "Debug Regular Expressions in real-time.",
    steps: ["Enter a Pattern (e.g. ^[a-z]+$).", "Add Flags (g, i, m).", "Type text to see matches highlighted."],
    tips: ["Use 'Smart Fill' to generate patterns from plain English.", "The 'g' flag is needed to find multiple matches."],
    status: "Live"
  },
  "/tools/developer/smart-diff": {
    title: "Code Comparator",
    desc: "Find differences between two blocks of text or code.",
    steps: ["Paste Original text on the left.", "Paste Modified text on the right.", "Green = Added, Red = Removed."],
    tips: ["Great for checking config file changes.", "Works with JSON, YAML, code, or plain text."],
    status: "Live"
  },
  "/tools/developer/smart-pass": {
    title: "Secure Generator",
    desc: "Create cryptographically strong passwords locally.",
    steps: ["Set Length (16+ recommended).", "Toggle Symbols/Numbers.", "Click Generate."],
    tips: ["Longer is better than complex.", "Don't use common words or birthdays."],
    status: "Live"
  },
  "/tools/developer/smart-base64": {
    title: "Base64 Encoder",
    desc: "Convert text or files to Base64 strings.",
    steps: ["Select Text or File mode.", "Paste input or upload image.", "Copy the result string."],
    tips: ["Useful for embedding small images directly in CSS.", "Decodes JWT payloads easily."],
    status: "Live"
  },
  "/tools/developer/smart-hash": {
    title: "Hash Generator",
    desc: "Create crypto fingerprints (MD5, SHA).",
    steps: ["Enter text or drop a file.", "View calculated hashes.", "Copy SHA-256 for verification."],
    tips: ["Hashes are one-way; they cannot be decrypted.", "SHA-256 is the modern standard for file integrity."],
    status: "Live"
  },
  "/tools/developer/smart-json2ts": {
    title: "JSON to TS",
    desc: "Generate TypeScript Interfaces from JSON.",
    steps: ["Paste a JSON response.", "Click Convert.", "Copy the Interface definition."],
    tips: ["Saves time manually typing API responses.", "Handles nested objects automatically."],
    status: "Live"
  },

  // ==========================
  // 📄 DOCUMENTS
  // ==========================
  "/tools/documents/pdf/merge": {
    title: "PDF Combiner",
    desc: "Merge multiple PDF files into a single document securely.",
    steps: ["Drag and drop PDF files.", "Reorder them in the list.", "Click 'Merge & Download'."],
    tips: ["Processed 100% locally using WebAssembly.", "No file size limits since it runs on your device."],
    status: "Live"
  },
  "/tools/documents/image/compressor": {
    title: "Image Optimizer",
    desc: "Reduce image file size without significant quality loss.",
    steps: ["Upload a heavy PNG or JPG.", "Adjust the 'Quality' slider.", "Compare 'Original' vs 'Compressed' preview."],
    tips: ["80% quality usually saves 50% size with no visible loss.", "WebP format offers better compression than JPG."],
    status: "Live"
  },
  "/tools/documents/smart-ocr": {
    title: "Smart OCR",
    desc: "Extract text from images locally.",
    steps: ["Upload an image containing text.", "Wait for processing.", "Copy the extracted text."],
    tips: ["Best results with high contrast images.", "Works on screenshots and scanned docs."],
    status: "Live"
  },

  // ==========================
  // 🩺 HEALTH
  // ==========================
  "/tools/health/smart-bmi": {
    title: "Health Gauge",
    desc: "Visual Body Mass Index calculator.",
    steps: ["Set Height and Weight sliders.", "Read your status on the color gauge.", "Check dynamic health tips."],
    tips: ["BMI is a general indicator.", "Athletes may have high BMI due to muscle mass."],
    status: "Live"
  },
  "/tools/health/smart-workout": {
    title: "HIIT Timer",
    desc: "Interval timer for High-Intensity Interval Training.",
    steps: ["Set Work/Rest duration.", "Start the timer.", "Follow the color cues (Orange=Work, Blue=Rest)."],
    tips: ["Standard Tabata is 20s Work, 10s Rest.", "Focus on consistency over intensity when starting."],
    status: "Live"
  },
  "/tools/health/smart-breath": {
    title: "Breathing Guide",
    desc: "Visual meditation aid for relaxation and focus.",
    steps: ["Select a Preset (Relax, Focus, Balance).", "Click Start.", "Follow the expanding circle (Inhale, Hold, Exhale)."],
    tips: ["4-7-8 breathing helps with sleep.", "Box breathing (4-4-4-4) is great for focus."],
    status: "Live"
  },

  // ==========================
  // 🤖 AI TOOLS
  // ==========================
  "/tools/ai/smart-chat": {
    title: "Local Bot UI",
    desc: "A clean, private chat interface for testing prompts or simulating AI.",
    steps: ["Type a message in the input box.", "Press Enter to send.", "Watch the simulated response appear."],
    tips: ["This is a UI demo; no real data is sent to OpenAI.", "Perfect for drafting prompts before using paid APIs."],
    status: "Live"
  },
  "/tools/ai/smart-voice": {
    title: "Speech Studio",
    desc: "Turn text into speech using your browser's neural voices.",
    steps: ["Type text into the editor.", "Select a Voice, Speed, and Pitch.", "Click 'Speak' to listen."],
    tips: ["Works 100% offline using Web Speech API.", "Different browsers (Chrome, Safari) offer different voices."],
    status: "Live"
  }
};

export const DEFAULT_GUIDE: GuideData = {
  title: "One Tool Guide",
  desc: "Select a specific tool to see its user manual and functional specifications.",
  steps: ["Navigate to a tool via the Dashboard.", "Click this (i) icon again to see context-specific help."],
  tips: ["All tools work 100% offline.", "Data is saved automatically to your browser."],
  status: "Draft"
};
