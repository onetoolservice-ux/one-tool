import React from "react";
import { 
  Wallet, Calculator, Lock, Layers, Image, Zap, Braces, Heart, Wind, Sparkles, Scale, RefreshCw, FileText, Palette, QrCode, Type, Contrast, TrendingUp, Droplets, PieChart, Crop, Landmark, Briefcase, Code2, Database, Wifi, FileCode, Split, Clock, Scissors, CheckCircle, ArrowRight, Ratio, Binary, Key, Link, Hash, Fingerprint, Shield, Network, Globe, Terminal, Server, Activity, Box, Minimize, Search, Command, ScanLine, FileSpreadsheet, FileType, Dumbbell, Mic, BrainCircuit, Ruler, Pipette, Timer, ListTodo, StickyNote, FileJson, FileDigit, Languages, Mail, Eye, MessageSquare, Home, ArrowRightLeft, Calendar
} from "lucide-react";

export const ALL_TOOLS = [
  // --- BUSINESS HEROES ---
  { 
    id: "salary-slip", 
    name: "Salary Slip Studio", 
    desc: "Generate compliant HR Payslips instantly.", 
    keywords: ["payslip generator", "salary certificate", "income proof", "employee slip", "hr tools india", "payroll calculator", "pay stub maker", "sallery slip", "pay slip format", "salary receipt", "wage slip", "proof of income", "hr payroll", "salary statement", "download payslip"],
    category: "Business", subcategory: "HR Tools", href: "/tools/business/salary-slip", icon: FileText, status: "New", popular: true 
  },
  { 
    id: "invoice-generator", 
    name: "Pro Invoice Studio", 
    desc: "Create & Download PDF Invoices.", 
    keywords: ["bill maker", "receipt generator", "gst invoice", "freelance bill", "invoice template", "billing software", "reciept maker", "estimate maker", "proforma invoice", "tax invoice", "commercial invoice", "bill generator online", "free invoice maker", "invoice pdf", "billing app"],
    category: "Business", subcategory: "Finance", href: "/tools/business/invoice-generator", icon: FileText, status: "New", popular: true 
  },
  { 
    id: "smart-agreement", 
    name: "Legal Contract Studio", 
    desc: "NDAs, Service Agreements & Offers.", 
    keywords: ["legal documents", "rent agreement format", "offer letter maker", "nda template", "freelance contract", "legal drafter", "lawyer tools", "consultancy agreement", "employment contract", "non disclosure agreement", "lease agreement", "mou format", "service contract", "legal forms"],
    category: "Business", subcategory: "Legal", href: "/tools/business/smart-agreement", icon: Shield, status: "New", popular: true 
  },
  { 
    id: "id-card", 
    name: "ID Card Creator", 
    desc: "Design & Print Employee IDs.", 
    keywords: ["id card maker", "employee badge", "visiting card", "identity card format", "staff id", "virtual id", "business card maker", "student id card", "press card", "gate pass", "visitor badge", "conference badge", "membership card", "id maker online"],
    category: "Business", subcategory: "HR Tools", href: "/tools/business/id-card", icon: Fingerprint, status: "New", popular: true 
  },
  { 
    id: "rent-receipt", 
    name: "Rent Receipt Generator", 
    desc: "HRA Proofs for Tax Saving.", 
    keywords: ["hra receipt", "house rent receipt", "tax proof", "rent slip", "monthly rent", "income tax proof", "hra exemption", "rent acknowledgement", "landlord receipt", "tax saving tools", "rent payment proof", "hra calculator", "rental slip"],
    category: "Finance", subcategory: "Tax", href: "/tools/finance/rent-receipt", icon: Home, status: "New", popular: true 
  },

  // --- FINANCE HEROES ---
  { 
    id: "smart-budget", 
    name: "Budget Planner Pro", 
    desc: "50/30/20 Rule Expense Tracker.", 
    keywords: ["expense manager", "monthly budget", "spending tracker", "personal finance", "money manager", "savings calculator", "buget planner", "50 30 20 rule", "budgeting app", "expense diary", "daily expense", "income tracker", "financial planner", "budget sheet"],
    category: "Finance", subcategory: "Personal Finance", href: "/tools/finance/smart-budget", icon: Wallet, status: "New", popular: true 
  },
  { 
    id: "smart-loan", 
    name: "Smart Loan", 
    desc: "Amortization & Interest Simulator.", 
    keywords: ["emi calculator", "loan payoff", "mortgage calc", "interest rate", "debt free", "car loan emi", "home loan calculator", "personal loan emi", "interest calculator", "amortization schedule", "loan repayment", "bank loan calc", "education loan"],
    category: "Finance", subcategory: "Calculators", href: "/tools/finance/smart-loan", icon: Calculator, status: "Ready", popular: true 
  },
  { 
    id: "smart-sip", 
    name: "Smart SIP", 
    desc: "Mutual Fund Wealth Builder.", 
    keywords: ["sip calculator", "mutual fund return", "wealth estimator", "investment planner", "compound interest", "stocks", "systematic investment plan", "rd calculator", "fd calculator", "returns calculator", "groww sip", "zerodha sip", "investment calc", "cagr calculator"],
    category: "Finance", subcategory: "Investments", href: "/tools/finance/smart-sip", icon: TrendingUp, status: "Ready", popular: true 
  },
  { 
    id: "smart-net-worth", 
    name: "Smart Net Worth", 
    desc: "Total Asset Tracker.", 
    keywords: ["wealth tracker", "assets vs liabilities", "personal balance sheet", "financial health", "networth calculator", "net worth tracker", "asset management", "debt tracker", "money tracking", "financial dashboard", "wealth calc"],
    category: "Finance", subcategory: "Personal Finance", href: "/tools/finance/smart-net-worth", icon: Landmark, status: "Ready", popular: false 
  },
  { 
    id: "smart-retirement", 
    name: "Smart Retirement", 
    desc: "FIRE Projection Engine.", 
    keywords: ["retirement planning", "fire calculator", "pension planner", "early retirement", "401k calc", "ppf calculator", "nps calculator", "retirement corpus", "financial freedom", "retirement age", "pension pot", "investment goal"],
    category: "Finance", subcategory: "Planning", href: "/tools/finance/smart-retirement", icon: Briefcase, status: "Ready", popular: false 
  },

  // --- DOCUMENT HEROES ---
  { 
    id: "universal-converter", 
    name: "Universal Converter", 
    desc: "Convert Images, Audio & Docs.", 
    keywords: ["file converter", "format changer", "convert pdf", "convert image", "mp3 converter", "video converter", "all in one converter", "pdf to word", "word to pdf", "jpg to png", "png to jpg", "mp4 to mp3", "wav converter", "document converter", "online file switch"],
    category: "Documents", subcategory: "All-in-One", href: "/tools/documents/universal-converter", icon: RefreshCw, status: "New", popular: true 
  },
  { 
    id: "smart-pdf-merge", 
    name: "PDF Workbench", 
    desc: "Visual Drag-and-Drop Merge.", 
    keywords: ["combine pdf", "join pdf", "pfd merge", "pdf binder", "merge files", "pdf organizer", "pdf joiner", "pdf combiner", "merge pdf online", "pdf tool", "organize pdf", "compile pdf"],
    category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/smart-pdf-merge", icon: Layers, status: "Ready", popular: true 
  },
  { 
    id: "smart-scan", 
    name: "Smart Scan", 
    desc: "Images to PDF Converter.", 
    keywords: ["jpg to pdf", "image to pdf", "photo scanner", "document scanner", "png to pdf", "scan to pdf", "photos to document", "img2pdf", "jpeg to pdf", "picture to pdf", "online scanner", "digitize documents"],
    category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/smart-scan", icon: ScanLine, status: "New", popular: true 
  },
  { 
    id: "smart-img-compress", 
    name: "Image Compressor", 
    desc: "Shrink image size locally.", 
    keywords: ["compress png", "reduce image size", "shrink jpg", "optimize images", "tiny png", "photo compress", "image optimizer", "resize image", "smaller image", "compress jpeg", "lossless compression", "reduce photo size"],
    category: "Documents", subcategory: "Images", href: "/tools/documents/smart-img-compress", icon: Minimize, status: "Ready", popular: true 
  },
  { 
    id: "smart-img-convert", 
    name: "Image Converter", 
    desc: "PNG/JPG/WEBP Switch.", 
    keywords: ["png to jpg", "webp converter", "image format", "picture converter", "heic to jpg", "jpg to png", "image changer", "photo format", "convert picture", "bmp converter", "tiff converter"],
    category: "Documents", subcategory: "Images", href: "/tools/documents/smart-img-convert", icon: RefreshCw, status: "Ready", popular: false 
  },
  { 
    id: "smart-pdf-split", 
    name: "PDF Split", 
    desc: "Extract pages instantly.", 
    keywords: ["split pdf", "extract pages", "separate pdf", "cut pdf", "pdf cutter", "pdf separator", "remove pages pdf", "break pdf", "pdf divider", "page extractor"],
    category: "Documents", subcategory: "PDF Tools", href: "/tools/documents/smart-pdf-split", icon: Scissors, status: "Ready", popular: false 
  },
  { 
    id: "smart-word", 
    name: "Smart Word", 
    desc: "Distraction-free Writer.", 
    keywords: ["text editor", "online notepad", "word processor", "writing app", "zen mode", "distraction free", "simple writer", "note taking", "drafting tool", "online doc", "rich text editor"],
    category: "Documents", subcategory: "Editors", href: "/tools/documents/smart-word", icon: FileText, status: "New", popular: false 
  },
  { 
    id: "smart-excel", 
    name: "Smart Excel", 
    desc: "Web Spreadsheet Editor.", 
    keywords: ["csv editor", "excel online", "spreadsheet viewer", "edit csv", "table editor", "online sheets", "data editor", "csv viewer", "excel viewer", "grid editor"],
    category: "Documents", subcategory: "Editors", href: "/tools/documents/smart-excel", icon: FileSpreadsheet, status: "New", popular: false 
  },
  { 
    id: "smart-ocr", 
    name: "Smart OCR", 
    desc: "Extract Text from Images.", 
    keywords: ["image to text", "ocr online", "picture to text", "grab text", "screenshot to text", "text extractor", "photo to text", "optical character recognition", "scanned pdf to text", "extract words from image"],
    category: "Documents", subcategory: "Converters", href: "/tools/documents/smart-ocr", icon: FileType, status: "New", popular: true 
  },

  // --- DEVELOPER HEROES ---
  { 
    id: "api-playground", 
    name: "API Playground", 
    desc: "Test REST Endpoints.", 
    keywords: ["postman online", "rest client", "api tester", "http request", "curl gui", "api debug", "rest api tool", "webhook tester", "json request", "get post put delete"],
    category: "Developer", subcategory: "Network", href: "/tools/developer/api-playground", icon: Globe, status: "New", popular: true 
  },
  { 
    id: "smart-jwt", 
    name: "JWT Debugger", 
    desc: "Decode & Verify JWT Tokens.", 
    keywords: ["jwt decoder", "json web token", "token viewer", "jwt io", "decode jwt", "token debugger", "jwt verifier", "claims viewer", "auth token", "bearer token"],
    category: "Developer", subcategory: "Security", href: "/tools/developer/smart-jwt", icon: Key, status: "New", popular: true 
  },
  { 
    id: "smart-json", 
    name: "JSON Editor", 
    desc: "Validate & Beautify.", 
    keywords: ["json formatter", "json lint", "prettify json", "json validator", "json viewer", "json parser", "json beautifier", "format json", "json fix", "json tool"],
    category: "Developer", subcategory: "Code", href: "/tools/developer/smart-json", icon: Braces, status: "Ready", popular: true 
  },
  { 
    id: "smart-sql", 
    name: "SQL Formatter", 
    desc: "Beautify Queries.", 
    keywords: ["sql beautifier", "sql pretty print", "format sql", "database query formatter", "sql lint", "sql parser", "query formatter", "sql cleaner", "sql indenter"],
    category: "Developer", subcategory: "Database", href: "/tools/developer/smart-sql", icon: Database, status: "Ready", popular: true 
  },
  { 
    id: "cron-gen", 
    name: "Cron Generator", 
    desc: "Visual Cron Schedule Builder.", 
    keywords: ["cron job", "crontab generator", "schedule parser", "cron syntax", "cron expression", "cron maker", "cron schedule", "linux cron"],
    category: "Developer", subcategory: "Ops", href: "/tools/developer/cron-gen", icon: Clock, status: "Ready", popular: false 
  },
  { 
    id: "git-cheats", 
    name: "Git Commands", 
    desc: "Interactive Cheat Sheet.", 
    keywords: ["git help", "git commands", "github cheat sheet", "git undo", "git reset", "git push", "git pull", "git merge", "git guide", "version control"],
    category: "Developer", subcategory: "Ops", href: "/tools/developer/git-cheats", icon: Terminal, status: "Ready", popular: false 
  },
  { 
    id: "smart-regex", 
    name: "Regex Tester", 
    desc: "Pattern Matching.", 
    keywords: ["regexr", "regular expression", "regex check", "grep online", "regex generator", "regex validator", "pattern match", "regexp test"],
    category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-regex", icon: Code2, status: "Ready", popular: true 
  },
  { 
    id: "smart-diff", 
    name: "Text Diff", 
    desc: "Compare Code.", 
    keywords: ["diff checker", "compare text", "code compare", "file difference", "text compare", "diff tool", "difference finder", "code diff"],
    category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-diff", icon: Split, status: "Ready", popular: false 
  },
  { 
    id: "smart-json2ts", 
    name: "JSON to TS", 
    desc: "Generate Interfaces.", 
    keywords: ["json to typescript", "interface generator", "json to type", "ts interface", "typescript generator", "json to interface", "type definition"],
    category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-json2ts", icon: FileCode, status: "New", popular: true 
  },
  { 
    id: "smart-url", 
    name: "URL Parser", 
    desc: "Decode/Encode.", 
    keywords: ["url decoder", "percent encoding", "url params", "parse query string", "url encoder", "link decoder", "uri decode", "url break"],
    category: "Developer", subcategory: "Network & Web", href: "/tools/developer/smart-url", icon: Link, status: "New", popular: true 
  },
  { 
    id: "smart-uuid", 
    name: "UUID Gen", 
    desc: "Unique IDs.", 
    keywords: ["guid generator", "uuid v4", "random id", "unique identifier", "uuid generator", "bulk uuid", "random string", "guid maker"],
    category: "Developer", subcategory: "SysAdmin", href: "/tools/developer/smart-uuid", icon: Hash, status: "Ready", popular: false 
  },
  { 
    id: "smart-base64", 
    name: "Base64", 
    desc: "Encode/Decode.", 
    keywords: ["base64 encoder", "base64 decoder", "text to base64", "image to base64", "base64 convert", "base64 string", "decode base64"],
    category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-base64", icon: Binary, status: "Ready", popular: true 
  },
  { 
    id: "smart-html-entities", 
    name: "HTML Entities", 
    desc: "Escape/Unescape.", 
    keywords: ["html escape", "xml escape", "html decode", "special characters", "html encode", "entity converter", "html string"],
    category: "Developer", subcategory: "Code Utilities", href: "/tools/developer/smart-html-entities", icon: Code2, status: "Ready", popular: false 
  },

  // --- PRODUCTIVITY ---
  { 
    id: "life-os", 
    name: "Life OS Planner", 
    desc: "Daily, Weekly & Macro Goals.", 
    keywords: ["todo list", "daily planner", "habit tracker", "goal setting", "week plan", "notion template", "life organizer", "task manager", "productivity dashboard", "agenda"],
    category: "Productivity", subcategory: "Time", href: "/tools/productivity/life-os", icon: Calendar, status: "New", popular: true 
  },
  { 
    id: "qr-code", 
    name: "QR Generator", 
    desc: "Custom Colors & Logos.", 
    keywords: ["make qr code", "qr creator", "link to qr", "wifi qr", "barcode generator", "qr code maker", "custom qr", "qr scan"],
    category: "Productivity", subcategory: "Tools", href: "/tools/productivity/qr-code", icon: QrCode, status: "Ready", popular: true 
  },
  { 
    id: "smart-pass", 
    name: "Password Gen", 
    desc: "Secure Strings & Strength Meter.", 
    keywords: ["password maker", "secure password", "random string", "password strength", "strong password", "password creator", "passphrase generator"],
    category: "Productivity", subcategory: "Security", href: "/tools/productivity/smart-pass", icon: Lock, status: "Ready", popular: true 
  },
  { 
    id: "pomodoro", 
    name: "Pomodoro", 
    desc: "Focus Timer.", 
    keywords: ["focus timer", "study clock", "tomato timer", "productivity timer", "work timer", "pomodoro clock", "focus technique", "time management"],
    category: "Productivity", subcategory: "Time", href: "/tools/productivity/pomodoro", icon: Timer, status: "Ready", popular: true 
  },

  // --- CONVERTERS ---
  { 
    id: "json-csv", 
    name: "JSON <> CSV", 
    desc: "Data Transform.", 
    keywords: ["convert json to csv", "csv to json", "data converter", "excel to json", "csv export", "json export", "data format"],
    category: "Converters", subcategory: "File Formats", href: "/tools/converters/json-csv", icon: FileJson, status: "New", popular: true 
  },
  { 
    id: "unit-convert", 
    name: "Unit Converter Pro", 
    desc: "Length, Mass, Currency & Data.", 
    keywords: ["measurement converter", "length converter", "weight converter", "temperature calc", "currency converter", "speed converter", "volume converter", "area converter", "unit switch"],
    category: "Converters", subcategory: "Measurements", href: "/tools/converters/unit-convert", icon: ArrowRightLeft, status: "New", popular: true 
  },
  { 
    id: "case-convert", 
    name: "Case Converter", 
    desc: "camelCase / snake_case.", 
    keywords: ["uppercase to lowercase", "title case", "camelcase generator", "text transformer", "capitalize", "sentence case", "slugify", "kebab case"],
    category: "Converters", subcategory: "Text", href: "/tools/converters/case-convert", icon: Type, status: "Ready", popular: false 
  },
  { 
    id: "color-picker", 
    name: "Color Picker", 
    desc: "HEX/RGB/HSL.", 
    keywords: ["color code picker", "hex to rgb", "color palette", "eyedropper", "web colors", "rgb to hex", "hsl converter", "color wheel", "gradient generator"],
    category: "Design", subcategory: "Color", href: "/tools/design/color-picker", icon: Pipette, status: "Ready", popular: true 
  },

  // --- HEALTH & AI ---
  { 
    id: "smart-bmi", 
    name: "Smart BMI", 
    desc: "Body Mass Index.", 
    keywords: ["bmi calculator", "fitness tracker", "ideal weight", "body fat", "health calc", "weight loss"],
    category: "Health", subcategory: "Body Metrics", href: "/tools/health/smart-bmi", icon: Scale, status: "New", popular: true 
  },
  { 
    id: "smart-breath", 
    name: "Box Breathing", 
    desc: "Stress Relief Guide.", 
    keywords: ["meditation timer", "breathing exercise", "relax app", "mindfulness", "calm app", "anxiety relief", "box breath"],
    category: "Health", subcategory: "Wellness", href: "/tools/health/smart-breath", icon: Wind, status: "New", popular: false },
  { 
    id: "smart-workout", 
    name: "HIIT Timer", 
    desc: "Interval Training.", 
    keywords: ["workout timer", "tabata timer", "gym clock", "interval timer", "fitness timer", "exercise clock", "7 min workout"],
    category: "Health", subcategory: "Fitness", href: "/tools/health/smart-workout", icon: Dumbbell, status: "New", popular: false 
  },
  { 
    id: "smart-chat", 
    name: "Smart Chat", 
    desc: "Local Bot UI.", 
    keywords: ["ai chat", "chatbot ui", "local llm", "gpt clone", "ai assistant", "chat interface"],
    category: "AI", subcategory: "Generative", href: "/tools/ai/smart-chat", icon: Sparkles, status: "New", popular: true 
  },
  { 
    id: "smart-analyze", 
    name: "Sentiment AI", 
    desc: "Analyze Emotion.", 
    keywords: ["sentiment analysis", "text emotion", "positive negative", "tone detector", "ai analysis", "text mining"],
    category: "AI", subcategory: "Analysis", href: "/tools/ai/smart-analyze", icon: BrainCircuit, status: "Ready", popular: false 
  }
];