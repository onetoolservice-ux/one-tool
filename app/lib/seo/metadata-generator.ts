import type { Tool } from '@/app/lib/utils/tools-fallback';

// Strip marketing prefixes so keywords match real user searches
function cleanName(name: string): string {
  return name
    .replace(/^(smart |pro |studio |ai )/i, '')
    .trim()
    .toLowerCase();
}

export function generateSEOTitle(tool: Tool): string {
  return `${tool.name} - Free Online Tool | OneTool`;
}

export function generateSEODescription(tool: Tool): string {
  return (
    tool.description ||
    `Use ${tool.name} free online. No signup required. Works entirely in your browser.`
  );
}

// ─── Per-tool keyword clusters ─────────────────────────────────────────────
// Each entry covers: the real search query users type (no "smart-" prefix),
// synonyms, related tasks, and long-tail variants.
const TOOL_KEYWORDS: Record<string, string[]> = {
  // ── Analytics ──────────────────────────────────────────────────────────────
  analyticsreport: [
    'analytics report builder', 'drag drop analytics', 'KPI dashboard free',
    'pivot table online', 'data report generator', 'shareable analytics report',
    'metrics dashboard', 'chart report builder', 'business analytics tool',
  ],
  managetransaction: [
    'upload bank statement', 'import bank CSV', 'bank statement analyzer',
    'HDFC statement import', 'SBI statement upload', 'ICICI bank CSV',
    'Axis bank statement', 'Kotak bank CSV', 'transaction manager',
    'parse bank statement online', 'bank export CSV analysis',
  ],
  expenses: [
    'expense tracker', 'track monthly expenses', 'expense analyzer',
    'bank statement expenses', 'debit transaction tracker', 'spending tracker',
    'expense breakdown by category', 'monthly expense report',
    'expense tracker India', 'personal expense tracker free',
  ],
  credits: [
    'income tracker', 'credit transaction tracker', 'salary income tracker',
    'freelance income tracker', 'bank credits analysis', 'income breakdown',
    'monthly income report', 'income sources analysis', 'earnings tracker',
  ],
  'self-serve-analytics': [
    'CSV chart maker', 'paste CSV get chart', 'CSV data visualizer',
    'no-code analytics', 'CSV to bar chart', 'CSV to line chart',
    'data visualization free', 'instant CSV analytics', 'upload CSV chart',
    'CSV statistics tool', 'CSV trend analysis',
  ],
  'autonomous-financial-analyst': [
    'AI financial analyst', 'AI finance tool', 'financial anomaly detection',
    'AI money analysis', 'automated financial insights', 'AI expense analyzer',
    'financial predictions AI', 'smart finance AI',
  ],

  // ── Finance ────────────────────────────────────────────────────────────────
  'smart-budget': [
    'budget planner', 'monthly budget', 'personal budget tool',
    'budget calculator free', 'income expense budget', '50/30/20 budget rule',
    'savings goal planner', 'budget tracker India', 'household budget planner',
    'create monthly budget online',
  ],
  'smart-loan': [
    'loan calculator', 'EMI calculator', 'home loan EMI', 'car loan calculator',
    'personal loan calculator', 'EMI calculator India', 'loan amortization',
    'total interest calculator', 'loan repayment schedule',
    'monthly installment calculator', 'bank loan EMI online',
  ],
  'smart-sip': [
    'SIP calculator', 'SIP returns calculator', 'mutual fund SIP calculator',
    'SIP investment calculator India', 'systematic investment plan calculator',
    'monthly SIP planner', 'lumpsum vs SIP', 'wealth accumulation calculator',
    'SIP maturity calculator', 'best SIP calculator online',
  ],
  'smart-net-worth': [
    'net worth calculator', 'net worth tracker', 'assets and liabilities tracker',
    'calculate net worth free', 'personal net worth', 'financial health checker',
    'total wealth calculator', 'balance sheet personal',
  ],
  'smart-retirement': [
    'retirement planner', 'retirement calculator India', 'retirement corpus calculator',
    'pension calculator', 'retirement savings planner', 'early retirement calculator',
    'inflation adjusted retirement', 'how much to retire', 'NPS calculator',
  ],
  'gst-calculator': [
    'GST calculator', 'GST calculator India', 'CGST SGST calculator',
    'IGST calculator', 'GST inclusive exclusive', 'tax calculator India',
    'goods services tax calculator', 'GST amount calculator',
    'reverse GST calculator', 'GST rate calculator 5% 12% 18% 28%',
  ],

  // ── Business ───────────────────────────────────────────────────────────────
  'invoice-generator': [
    'invoice generator', 'GST invoice generator', 'free invoice maker',
    'create invoice online', 'tax invoice India', 'GST bill maker',
    'invoice PDF download', 'GSTIN invoice', 'B2B invoice generator',
    'professional invoice creator', 'invoice template India',
    'billing software free', 'invoice maker no signup',
  ],
  'salary-slip': [
    'salary slip generator', 'payslip generator', 'salary slip maker India',
    'payslip creator free', 'salary slip PDF', 'HRA PF TDS salary slip',
    'monthly payslip generator', 'employee salary slip',
    'Indian payslip format', 'CTC salary breakup', 'salary statement generator',
  ],
  'smart-agreement': [
    'legal contract generator', 'NDA generator', 'service agreement template',
    'freelance contract maker', 'legal document generator free',
    'rent agreement template', 'business agreement creator',
    'contract template India', 'legal contract creator online',
  ],
  'id-card': [
    'ID card maker', 'employee ID card generator', 'ID card creator free',
    'company ID card design', 'ID card with photo', 'QR code ID card',
    'student ID card maker', 'staff ID card generator online',
  ],
  'rent-receipt': [
    'rent receipt generator', 'rent receipt for HRA', 'rental receipt maker',
    'HRA rent receipt', 'landlord receipt generator', 'rent receipt India',
    'rent receipt PDF download', 'monthly rent receipt creator',
  ],

  // ── Documents ──────────────────────────────────────────────────────────────
  'universal-converter': [
    'file converter online', 'document converter free', 'convert file format',
    'PDF to Word converter', 'Word to PDF', 'convert documents online',
    'file format converter', 'batch file converter', 'online converter no signup',
    'DOCX to PDF', 'convert 50 formats',
  ],
  'smart-scan': [
    'document scanner online', 'scan document camera', 'mobile document scanner',
    'scan to PDF', 'document scan app', 'photo to PDF scanner',
    'camera scan document', 'auto crop scan', 'document enhance scan',
  ],
  'smart-pdf-merge': [
    'merge PDF', 'combine PDF files', 'join PDF online', 'PDF merger free',
    'combine multiple PDFs', 'PDF combiner online', 'merge PDF no signup',
    'PDF workbench', 'reorder PDF pages', 'add pages to PDF',
    'merge PDF online free', 'unite PDF files',
  ],
  'smart-pdf-split': [
    'split PDF', 'extract PDF pages', 'PDF splitter free', 'split PDF online',
    'separate PDF pages', 'PDF page extractor', 'cut PDF into parts',
    'split PDF by page range', 'divide PDF file',
  ],
  'smart-img-compress': [
    'compress image online', 'reduce image size', 'image compressor free',
    'shrink image file size', 'optimize image', 'image size reducer',
    'compress JPG PNG free', 'batch image compressor', 'reduce photo size online',
    'compress image without quality loss',
  ],
  'smart-img-convert': [
    'image converter online', 'convert image format', 'PNG to JPG converter',
    'JPG to PNG converter', 'WebP converter', 'convert image to WebP',
    'GIF converter online', 'AVIF converter', 'image format changer free',
    'convert image free no signup',
  ],
  'smart-ocr': [
    'OCR online free', 'image to text converter', 'extract text from image',
    'scanned document to text', 'photo to text converter', 'OCR tool online',
    'picture to text', 'text recognition online', 'PDF to text OCR',
    'handwriting to text OCR',
  ],
  'smart-word': [
    'markdown editor online', 'markdown preview live', 'markdown to HTML',
    'markdown to PDF', 'markdown converter', 'markdown writer free',
    'live markdown editor', 'write markdown online', 'markdown renderer',
  ],
  'smart-excel': [
    'CSV editor online', 'edit CSV online', 'CSV viewer', 'spreadsheet online free',
    'CSV filter tool', 'CSV transform', 'data editor CSV', 'online CSV editor',
    'CSV spreadsheet tool', 'edit CSV no Excel',
  ],
  'json-csv': [
    'JSON to CSV converter', 'CSV to JSON converter', 'convert JSON CSV',
    'JSON CSV tool online', 'flatten JSON to CSV', 'CSV to JSON free',
    'JSON CSV transformer', 'parse JSON to spreadsheet',
  ],

  // ── Developer ──────────────────────────────────────────────────────────────
  'dev-station': [
    'developer tools online', 'developer toolkit', 'coding utility tools',
    'web developer tools', 'devtools browser', 'all-in-one dev tools',
    'encoder decoder online', 'base64 encoder', 'URL encoder', 'developer swiss knife',
  ],
  'api-playground': [
    'API tester online', 'REST API playground', 'test API online free',
    'API client browser', 'HTTP request tester', 'API testing tool',
    'Postman alternative free', 'REST client online', 'API response viewer',
    'test GET POST API free',
  ],
  'smart-jwt': [
    'JWT decoder', 'JWT debugger', 'decode JWT token', 'JWT token inspector',
    'JSON web token decoder', 'verify JWT online', 'JWT payload viewer',
    'JWT token analyzer', 'JWT debugger online free',
  ],
  'smart-json': [
    'JSON formatter', 'JSON beautifier', 'JSON validator', 'format JSON online',
    'JSON editor online', 'JSON pretty print', 'JSON syntax checker',
    'JSON tree view', 'fix JSON format', 'JSON linter free',
  ],
  'smart-sql': [
    'SQL formatter', 'SQL beautifier', 'format SQL online', 'SQL query formatter',
    'SQL pretty print', 'SQL indenter', 'beautify SQL query',
    'SQL code formatter free', 'clean SQL online',
  ],
  'cron-gen': [
    'cron expression generator', 'cron job builder', 'cron schedule maker',
    'crontab generator online', 'cron expression tester', 'next cron run time',
    'cron syntax builder', 'cron visual editor',
  ],
  'git-cheats': [
    'git commands cheat sheet', 'git reference guide', 'git commands list',
    'git tutorial commands', 'git cheatsheet online', 'common git commands',
    'git copy commands', 'learn git commands', 'git quick reference',
  ],
  'smart-diff': [
    'text diff tool', 'compare two texts', 'text comparison tool',
    'diff checker online', 'find text differences', 'text diff online free',
    'compare files online', 'side by side text compare', 'code diff tool',
  ],
  'regex-tester': [
    'regex tester', 'regular expression tester', 'test regex online',
    'regex checker', 'regex matcher online', 'live regex tester',
    'regex match highlighter', 'regex debugger', 'test regular expression free',
    'regex groups capture', 'regex replace online',
  ],
  'hash-gen': [
    'hash generator online', 'MD5 hash generator', 'SHA256 hash generator',
    'SHA512 hash online', 'generate hash free', 'checksum calculator',
    'file hash generator', 'text to hash', 'SHA1 generator online',
    'hash string online',
  ],
  'num-convert': [
    'number base converter', 'binary to decimal', 'hex to binary',
    'decimal to hexadecimal', 'octal converter', 'number system converter',
    'binary converter online', 'hex decimal binary converter free',
    'convert binary octal decimal hex',
  ],
  'timestamp-tool': [
    'unix timestamp converter', 'timestamp to date', 'epoch converter',
    'convert timestamp online', 'unix time converter', 'date to timestamp',
    'epoch time converter free', 'timestamp tool online', 'milliseconds to date',
    'ISO date converter',
  ],

  // ── Productivity ───────────────────────────────────────────────────────────
  'life-os': [
    'life planner online', 'habit tracker', 'goal tracker online',
    'daily planner free', 'task manager browser', 'life OS planner',
    'personal productivity planner', 'goals habits tasks tracker',
    'online daily organizer', 'life management tool',
  ],
  'qr-code': [
    'QR code generator', 'create QR code free', 'QR code maker',
    'QR code for URL', 'WiFi QR code generator', 'contact QR code',
    'custom QR code online', 'QR code download PNG', 'free QR generator no signup',
    'WhatsApp QR code', 'QR code with logo',
  ],
  'smart-pass': [
    'password generator', 'strong password generator', 'secure password creator',
    'random password generator', 'create strong password', 'password maker free',
    'password generator no signup', 'complex password generator',
    'generate secure password online',
  ],
  'pomodoro': [
    'Pomodoro timer', 'focus timer online', '25 minute work timer',
    'Pomodoro technique timer', 'productivity timer', 'study timer online',
    'work break timer', 'Pomodoro app browser', 'focus productivity timer free',
  ],

  // ── Converters ─────────────────────────────────────────────────────────────
  'unit-convert': [
    'unit converter online', 'length converter', 'weight converter',
    'temperature converter', 'kg to lbs converter', 'cm to inches',
    'kilometers to miles', 'metric imperial converter', 'volume converter',
    'area converter online', 'speed converter', 'unit conversion tool free',
  ],
  'case-convert': [
    'text case converter', 'uppercase lowercase converter', 'title case converter',
    'camelCase converter', 'snake_case converter', 'SCREAMING_SNAKE_CASE',
    'kebab-case converter', 'sentence case tool', 'change text case online',
    'convert text case free', 'PascalCase converter', 'text transformer',
  ],

  // ── Design ─────────────────────────────────────────────────────────────────
  'color-picker': [
    'color picker online', 'HEX color picker', 'RGB color picker',
    'HSL color tool', 'color palette generator', 'contrast ratio checker',
    'color accessibility tool', 'pick color free', 'web color picker',
    'convert HEX to RGB', 'convert RGB to HSL', 'color code picker',
  ],
  'color-studio': [
    'gradient generator', 'CSS gradient maker', 'linear gradient CSS',
    'radial gradient generator', 'conic gradient tool', 'background gradient maker',
    'gradient color picker', 'CSS gradient code', 'gradient preview live',
    'gradient presets', 'copy CSS gradient', 'gradient design tool free',
  ],

  // ── Health ─────────────────────────────────────────────────────────────────
  'smart-bmi': [
    'BMI calculator', 'body mass index calculator', 'BMI online free',
    'calculate BMI', 'healthy weight calculator', 'BMI chart',
    'ideal weight range', 'overweight calculator', 'BMI for adults India',
  ],
  'smart-breath': [
    'box breathing exercise', 'guided breathing online', '4-4-4-4 breathing',
    'breathing timer', 'stress relief breathing', 'calm breathing exercise',
    'breathing technique tool', 'relaxation breathing online', 'anxiety breathing tool',
  ],
  'smart-workout': [
    'HIIT timer', 'interval training timer', 'workout timer online',
    'tabata timer', 'HIIT workout timer free', 'interval timer browser',
    'work rest timer', 'exercise timer online', 'fitness timer free',
    'custom HIIT timer',
  ],

  // ── AI ─────────────────────────────────────────────────────────────────────
  'prompt-generator': [
    'AI prompt generator', 'ChatGPT prompt builder', 'Claude prompt generator',
    'prompt engineering tool', 'LLM prompt creator', 'prompt template generator',
    'generate AI prompts free', 'prompt ideas for ChatGPT',
    'AI writing prompt generator', 'best prompt generator online',
  ],
  'smart-chat': [
    'AI chat assistant', 'AI chatbot free', 'chat with AI online',
    'AI writing assistant', 'AI coding assistant', 'free AI chat no signup',
    'AI assistant browser', 'ChatGPT alternative free', 'AI conversation tool',
  ],
  'smart-analyze': [
    'sentiment analyzer', 'text sentiment analysis', 'analyze text emotion',
    'sentiment analysis free', 'positive negative neutral text',
    'review sentiment tool', 'tone analyzer online', 'text emotion detector',
    'social media sentiment tool', 'feedback analyzer online',
  ],

  // ── Creator ────────────────────────────────────────────────────────────────
  'audio-transcription': [
    'audio to text', 'speech to text online free', 'voice to text',
    'live transcription browser', 'microphone to text', 'transcribe audio free',
    'real time speech to text', 'audio transcription no signup',
    'voice recorder transcription', 'record and transcribe online',
    'Hindi speech to text', 'multilingual transcription',
  ],
};

// Category-level fallback keywords (used when no tool-specific entry exists)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Analytics:    ['data analytics tool', 'bank statement analysis', 'transaction analytics', 'financial insights'],
  Finance:      ['personal finance India', 'financial calculator', 'money management tool', 'savings calculator'],
  Business:     ['business document generator', 'GST compliant', 'professional document India', 'small business tool free'],
  Documents:    ['PDF tool online free', 'document converter', 'file converter browser', 'convert files online'],
  Developer:    ['developer tool online', 'coding utility', 'web developer tool free', 'programming tool browser'],
  Productivity: ['productivity tool free', 'task organizer online', 'time management tool', 'daily planner browser'],
  Converters:   ['online converter free', 'unit conversion tool', 'format converter browser'],
  Design:       ['design tool online', 'CSS tool free', 'color tool browser', 'UI design tool'],
  Health:       ['health calculator free', 'fitness tool online', 'wellness calculator browser'],
  AI:           ['AI tool free online', 'artificial intelligence tool', 'AI assistant free', 'AI no signup'],
  Creator:      ['content creator tool', 'media tool online free', 'creator utility browser'],
};

export function generateKeywords(tool: Tool): string[] {
  const name = tool.name.toLowerCase();
  const clean = cleanName(tool.name); // stripped of "Smart ", "Pro " etc.

  const base = [
    name,
    clean,
    `${clean} free`,
    `${clean} online`,
    `${clean} tool`,
    `free ${clean}`,
    `online ${clean}`,
    'free online tool',
    'onetool',
    'no signup',
    'browser tool',
    'works in browser',
  ].filter((v, i, arr) => arr.indexOf(v) === i); // dedupe

  const toolKws = TOOL_KEYWORDS[tool.id] || [];
  const categoryKws = CATEGORY_KEYWORDS[tool.category] || [];

  return [...base, ...toolKws, ...categoryKws];
}

export function generateOpenGraph(tool: Tool, baseUrl: string) {
  return {
    title: generateSEOTitle(tool),
    description: generateSEODescription(tool),
    url: `${baseUrl}${tool.href}`,
    siteName: 'OneTool',
    type: 'website' as const,
  };
}

export function generateTwitterCard(tool: Tool, baseUrl: string) {
  return {
    card: 'summary_large_image' as const,
    title: generateSEOTitle(tool),
    description: generateSEODescription(tool),
  };
}
