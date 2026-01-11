-- ==========================================
-- Seed Tools Data
-- ==========================================
-- This script migrates all tools from app/lib/tools-data.tsx to the database
-- Run this in Supabase SQL Editor AFTER running DATABASE_SCHEMA.sql
-- ==========================================

-- Clear existing tools (optional - comment out if you want to keep existing data)
-- DELETE FROM tools;

-- Insert all tools
INSERT INTO tools (id, name, category, href, icon_name, color, popular, status) VALUES

-- --- BUSINESS ---
('invoice-generator', 'Pro Invoice Studio', 'Business', '/tools/business/invoice-generator', 'FileText', 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', true, 'Ready'),
('salary-slip', 'Salary Slip Studio', 'Business', '/tools/business/salary-slip', 'FileText', 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400', true, 'Ready'),
('smart-agreement', 'Legal Contract Studio', 'Business', '/tools/business/smart-agreement', 'Shield', 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300', false, 'Ready'),
('id-card', 'ID Card Creator', 'Business', '/tools/business/id-card', 'User', 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400', false, 'Ready'),
('rent-receipt', 'Rent Receipt Generator', 'Business', '/tools/business/rent-receipt', 'Home', 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400', false, 'Ready'),

-- --- FINANCE ---
('smart-budget', 'Budget Planner Pro', 'Finance', '/tools/finance/smart-budget', 'Wallet', 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', true, 'Ready'),
('smart-loan', 'Smart Loan', 'Finance', '/tools/finance/smart-loan', 'Calculator', 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', false, 'Ready'),
('smart-sip', 'Smart SIP', 'Finance', '/tools/finance/smart-sip', 'TrendingUp', 'text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400', false, 'Ready'),
('smart-net-worth', 'Net Worth Tracker', 'Finance', '/tools/finance/smart-net-worth', 'Landmark', 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400', false, 'Ready'),
('smart-retirement', 'Retirement Planner', 'Finance', '/tools/finance/smart-retirement', 'Briefcase', 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', false, 'Ready'),
('gst-calculator', 'GST Calculator', 'Finance', '/tools/finance/gst-calculator', 'Percent', 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400', false, 'Ready'),

-- --- DOCUMENTS ---
('universal-converter', 'Universal Converter', 'Documents', '/tools/documents/universal-converter', 'RefreshCw', 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400', true, 'Ready'),
('smart-scan', 'Smart Scan', 'Documents', '/tools/documents/smart-scan', 'ScanLine', 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300', false, 'Ready'),
('smart-pdf-merge', 'PDF Workbench', 'Documents', '/tools/documents/smart-pdf-merge', 'Layers', 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400', false, 'Ready'),
('smart-pdf-split', 'PDF Splitter', 'Documents', '/tools/documents/smart-pdf-split', 'Scissors', 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400', false, 'Ready'),
('smart-img-compress', 'Image Compressor', 'Documents', '/tools/documents/smart-img-compress', 'Minimize', 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400', false, 'Ready'),
('smart-img-convert', 'Image Converter', 'Documents', '/tools/documents/smart-img-convert', 'Image', 'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400', false, 'Ready'),
('smart-ocr', 'Smart OCR', 'Documents', '/tools/documents/smart-ocr', 'FileType', 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400', false, 'Ready'),
('smart-word', 'Markdown Studio', 'Documents', '/tools/documents/smart-word', 'FileCode', 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300', false, 'Ready'),
('smart-excel', 'Data Studio (CSV)', 'Documents', '/tools/documents/smart-excel', 'Grid', 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', false, 'Ready'),

-- --- DEVELOPER ---
('dev-station', 'DevStation Pro', 'Developer', '/tools/developer/dev-station', 'Terminal', 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400', true, 'Ready'),
('api-playground', 'API Playground', 'Developer', '/tools/developer/api-playground', 'Globe', 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300', false, 'Ready'),
('smart-jwt', 'JWT Debugger', 'Developer', '/tools/developer/smart-jwt', 'Key', 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300', false, 'Ready'),
('smart-json', 'JSON Editor', 'Developer', '/tools/developer/smart-json', 'Braces', 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300', false, 'Ready'),
('smart-sql', 'SQL Formatter', 'Developer', '/tools/developer/smart-sql', 'Database', 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400', false, 'Ready'),
('cron-gen', 'Cron Generator', 'Developer', '/tools/developer/cron-gen', 'Clock', 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300', false, 'Ready'),
('git-cheats', 'Git Commands', 'Developer', '/tools/developer/git-cheats', 'Laptop', 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400', false, 'Ready'),
('smart-diff', 'Text Diff', 'Developer', '/tools/developer/smart-diff', 'Split', 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400', false, 'Ready'),

-- --- PRODUCTIVITY ---
('life-os', 'Life OS Planner', 'Productivity', '/tools/productivity/life-os', 'Calendar', 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400', false, 'Ready'),
('qr-code', 'QR Generator', 'Productivity', '/tools/productivity/qr-code', 'QrCode', 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300', false, 'Ready'),
('smart-pass', 'Password Gen', 'Productivity', '/tools/productivity/smart-pass', 'Lock', 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300', false, 'Ready'),
('pomodoro', 'Pomodoro Timer', 'Productivity', '/tools/productivity/pomodoro', 'Timer', 'text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300', false, 'Ready'),

-- --- CONVERTERS ---
('unit-convert', 'Unit Converter', 'Converters', '/tools/converters/unit-convert', 'ArrowRightLeft', 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-300', false, 'Ready'),
('case-convert', 'Case Converter', 'Converters', '/tools/converters/case-convert', 'Type', 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300', false, 'Ready'),

-- --- DESIGN ---
('color-picker', 'Color Picker', 'Design', '/tools/design/color-picker', 'Pipette', 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300', false, 'Ready'),

-- --- HEALTH ---
('smart-bmi', 'Smart BMI', 'Health', '/tools/health/smart-bmi', 'Scale', 'text-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300', false, 'Ready'),
('smart-breath', 'Box Breathing', 'Health', '/tools/health/smart-breath', 'Wind', 'text-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300', false, 'Ready'),
('smart-workout', 'HIIT Timer', 'Health', '/tools/health/smart-workout', 'Dumbbell', 'text-lime-500 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-300', false, 'Ready'),

-- --- AI ---
('smart-chat', 'AI Chat', 'AI', '/tools/ai/smart-chat', 'Sparkles', 'text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300', false, 'Ready'),
('smart-analyze', 'Sentiment AI', 'AI', '/tools/ai/smart-analyze', 'BrainCircuit', 'text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300', false, 'Ready'),
('prompt-generator', 'Prompt Generator', 'AI', '/tools/ai/prompt-generator', 'FileCode', 'text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-300', true, 'Ready')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  href = EXCLUDED.href,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  popular = EXCLUDED.popular,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Verify the insert
SELECT COUNT(*) as total_tools, 
       COUNT(*) FILTER (WHERE popular = true) as popular_tools,
       category, COUNT(*) as count
FROM tools 
GROUP BY category 
ORDER BY category;
