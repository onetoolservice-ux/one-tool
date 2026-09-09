import type { Tool } from '@/app/lib/utils/tools-fallback';

// Strip marketing prefixes so keywords match real user searches
function cleanName(name: string): string {
  return name
    .replace(/^(smart |pro |studio |ai )/i, '')
    .trim()
    .toLowerCase();
}

export function generateSEOTitle(tool: Tool): string {
  // Layout template appends " | OneTool" — don't duplicate it here
  return `${tool.name} - Free Online Tool`;
}

export function generateSEODescription(tool: Tool): string {
  return (
    tool.description ||
    `Use ${tool.name} free online. No signup required. Works entirely in your browser.`
  );
}

// ─── Per-tool keyword clusters ─────────────────────────────────────────────
// Each entry targets real search queries: intent-based phrases, synonyms,
// long-tail variants, and India-specific terms where relevant.
const TOOL_KEYWORDS: Record<string, string[]> = {

  // ── Personal Finance ───────────────────────────────────────────────────────
  'pf-statement-manager': [
    'bank statement analyzer India', 'upload bank statement CSV', 'import bank statement online',
    'HDFC statement analyzer', 'SBI statement upload', 'ICICI bank CSV parser',
    'Axis bank statement tool', 'Kotak statement import', 'bank CSV column mapper',
    'parse bank transactions online', 'bank statement to Excel', 'analyze bank statement free',
  ],
  'pf-financial-position': [
    'net financial position calculator', 'income outflow summary', 'monthly financial snapshot',
    'savings rate calculator from bank statement', 'financial period summary',
    'commitment ratio calculator', 'debt servicing ratio', 'personal balance sheet',
    'financial health summary India', 'income vs expense summary',
  ],
  'pf-cash-flow': [
    'personal cash flow statement', 'income outflow tracker', 'monthly income statement',
    'net surplus calculator', 'cash position tracker', 'income vs expense statement India',
    'closing balance tracker', 'period comparison income', 'personal P&L statement',
  ],
  'pf-tx-explorer': [
    'transaction search tool', 'bank transaction ledger', 'filter bank transactions',
    'sort transactions by amount', 'reclassify bank transactions', 'bulk tag transactions',
    'export transactions CSV', 'transaction history viewer', 'searchable transaction list',
  ],
  expenses: [
    'expense tracker India', 'bank statement expense tracker', 'track monthly expenses',
    'expense analyzer free', 'debit transaction tracker', 'spending tracker online',
    'expense breakdown by category', 'monthly expense report', 'personal expense tracker free',
    'filter expenses by merchant', 'bulk export expenses',
  ],
  'pf-expenditure': [
    'category wise spending breakdown', 'spending by category India', 'month on month spend comparison',
    'rename expense categories', 'merge transaction categories', 'spending analysis tool free',
    'expense category manager', 'where does my money go', 'monthly spend by merchant',
  ],
  'pf-commitments': [
    'recurring payment detector', 'auto detect EMI from bank statement', 'fixed obligations tracker',
    'standing instruction detector', 'commitment register India', 'recurring expense finder',
    'SIP auto-detect bank statement', 'rent detection bank statement', 'monthly obligations tracker',
  ],
  'pf-recurring': [
    'recurring debit analyzer', 'auto-detected recurring payments', 'subscription detector bank statement',
    'recurring charges finder', 'standing instructions tracker', 'bulk categorize recurring debits',
    'automatic payment tracker', 'merchant recurring payments', 'bank auto-debit tracker',
  ],
  'pf-top-merchants': [
    'top merchants by spending', 'where I spend most', 'merchant spending leaderboard',
    'top spenders tracker', 'merchant spend analysis India', 'highest spend merchants',
    'merchant category assignment', 'spending by store', 'top vendors analysis',
  ],
  'pf-big-spends': [
    'large transaction finder', 'big spend tracker', 'high value transaction filter',
    'transactions above threshold', 'large expense detector', 'one-off large expenses',
    'spot big spends bank statement', 'unusual large transactions', 'filter high value debits',
  ],
  'pf-rules': [
    'auto categorization rules transactions', 'keyword based transaction rules',
    'merchant name rule matching', 'auto label transactions', 'transaction classification rules',
    'bank statement automation rules', 'categorize transactions automatically India',
    'regex rules for expenses', 'smart categorization rules',
  ],
  credits: [
    'income tracker from bank statement', 'credit transaction tracker', 'salary income tracker',
    'freelance income tracker', 'UPI receipt tracker', 'bank credits analysis',
    'income breakdown by source', 'monthly income report India', 'earnings tracker bank',
  ],
  'pf-daily-pulse': [
    'daily spending analysis', 'average daily spend tracker', 'daily transaction statistics',
    'weekday vs weekend spending', 'transactions per day analysis', 'daily spend pattern India',
    'daily budget tracker bank statement', 'highest spend day finder', 'no-spend day tracker',
  ],
  'pf-behavior': [
    'spending behavior analysis', 'when do I spend most', 'day of week spending pattern',
    'spending psychology tracker', 'behavioral finance tool India', 'day of month spend analysis',
    'impulse spending detector', 'spend timing pattern', 'behavioral spending insights',
  ],
  'pf-savings-trend': [
    'savings rate tracker', 'monthly savings trend', 'savings over time chart',
    'improving savings analysis', 'savings rate history India', 'month by month savings',
    'savings vs spending trend', 'net surplus trend tracker', 'savings improvement analyzer',
  ],
  'pf-month-compare': [
    'month to month spending comparison', 'compare two months expenses', 'MoM expense change',
    'side by side month comparison', 'spending change analyzer', 'monthly variance report',
    'compare spending periods', 'budget comparison month over month India',
  ],
  'pf-heatmap': [
    'spending calendar heatmap', 'daily spend intensity calendar', 'spending calendar India',
    'calendar view transactions', 'heatmap daily expenses', 'visual spending calendar',
    'monthly spending grid', 'high spend days calendar', 'spending intensity map',
  ],
  'pf-subscriptions': [
    'subscription finder bank statement', 'subscription detector India', 'find subscriptions in bank statement',
    'Netflix Spotify SIP auto-detect', 'fixed amount recurring payment finder',
    'annual subscription cost calculator', 'cancel subscriptions India', 'subscription audit tool',
    'OTT subscription tracker India', 'insurance premium tracker bank statement',
  ],
  'pf-labels': [
    'custom transaction labels', 'transaction tagging tool', 'color coded transaction tags',
    'custom category tags transactions', 'label manager personal finance', 'tag bank transactions free',
    'personal transaction labeling', 'custom filter tags bank data', 'transaction grouping tool',
  ],
  'pf-liability': [
    'loan EMI tracker bank statement', 'liability ledger personal', 'EMI burden ratio calculator',
    'total EMI from bank statement', 'debt obligations tracker India', 'loan grouping bank data',
    'monthly debt burden analyzer', 'auto detect loans bank statement',
  ],
  'autonomous-financial-analyst': [
    'AI financial analyst free', 'AI money insights', 'financial anomaly detection',
    'AI expense analyzer India', 'automated financial insights', 'AI spending predictions',
    'smart finance insights AI', 'personalized money recommendations AI',
    'AI bank statement analysis', 'ChatGPT for personal finance',
  ],
  'pf-health-score': [
    'financial health score India', 'personal finance score', 'money health check',
    'financial fitness rating', 'savings score calculator', 'debt score tracker',
    'emergency fund score', 'investment health score', 'financial wellness score India',
    '5 dimension financial health', 'rate my finances',
  ],
  'pf-spending-dna': [
    'money personality test', 'spending personality type', 'financial archetype quiz',
    'spender vs saver personality', 'spending DNA analysis', 'money behavior profile India',
    'financial personality insights', 'what kind of spender am I', 'money mindset analyzer',
  ],
  'pf-investment-tracker': [
    'investment portfolio tracker India', 'mutual fund tracker free', 'stock portfolio tracker',
    'XIRR calculator portfolio', 'asset allocation tracker', 'equity debt gold crypto tracker',
    'portfolio gain loss analysis', 'investment returns calculator India', 'no broker login portfolio tracker',
    'multi asset portfolio manager', 'net worth investments tracker',
  ],
  'pf-budget-vs-actual': [
    'budget vs actual spending tracker', 'set budget track spending', 'category budget tracker India',
    'overspend alert by category', 'monthly budget performance', 'budget adherence tracker',
    'planned vs actual expenses India', 'budget progress bar tool', 'variance analysis budget',
  ],
  'pf-financial-snapshot': [
    'personal finance dashboard India', 'all-in-one finance overview', 'financial life overview tool',
    'single page financial summary', 'income expenses investments dashboard', 'financial snapshot free',
    'personal finance command center', 'complete financial picture India', 'finance summary one page',
  ],

  // ── Finance Calculators ────────────────────────────────────────────────────
  'smart-budget': [
    'monthly budget planner free', 'personal budget calculator India', 'income expense budget tool',
    '50/30/20 budget rule calculator', 'savings goal planner', 'household budget planner online',
    'create monthly budget India', 'budget template online free', 'zero based budgeting tool',
  ],
  'smart-loan': [
    'EMI calculator India', 'loan calculator free', 'home loan EMI calculator',
    'car loan EMI calculator', 'personal loan calculator India', 'loan amortization schedule',
    'total interest calculator', 'monthly installment calculator', 'bank loan EMI online',
    'compare loan options', 'loan repayment planner',
  ],
  'smart-sip': [
    'SIP calculator India', 'mutual fund SIP returns calculator', 'SIP investment planner',
    'systematic investment plan calculator', 'lumpsum vs SIP comparison', 'SIP maturity calculator',
    'monthly SIP amount planner', 'wealth accumulation SIP', 'best SIP calculator India',
    'SIP returns projection', 'SIP goal planner',
  ],
  'smart-net-worth': [
    'net worth calculator India', 'assets liabilities tracker', 'calculate net worth free',
    'personal net worth tracker', 'total wealth calculator', 'balance sheet personal India',
    'financial health tracker net worth', 'monitor net worth growth', 'add bank balance investment property',
  ],
  'smart-retirement': [
    'retirement corpus calculator India', 'retirement planner free', 'retirement savings calculator',
    'how much to retire India', 'inflation adjusted retirement corpus', 'early retirement calculator India',
    'retirement age planner', 'monthly SIP for retirement', 'NPS pension calculator India',
    'retirement fund target calculator',
  ],
  'gst-calculator': [
    'GST calculator India', 'GST amount calculator', 'CGST SGST calculator',
    'IGST calculator', 'GST inclusive exclusive price', 'reverse GST calculator',
    'goods services tax calculator India', 'GST 5% 12% 18% 28% calculator',
    'add GST to price India', 'remove GST from price', 'tax amount calculator India',
  ],
  'fire-calc': [
    'FIRE calculator India', 'Financial Independence Retire Early calculator',
    'retire early calculator India', 'financial independence number', 'FIRE corpus calculator',
    'how much to retire early India', 'FIRE age calculator', 'lean FIRE fat FIRE calculator',
    'monthly savings for FIRE', 'FIRE movement India calculator',
  ],
  'cost-of-delay': [
    'cost of delaying investment', 'investment delay calculator', 'wealth lost by waiting',
    'compound interest delay calculator', 'start investing early calculator India',
    'procrastination investment cost', 'early vs late investment comparison',
    'how much does delay cost investment', 'invest now vs later calculator',
  ],
  'debt-planner': [
    'debt repayment planner India', 'snowball vs avalanche debt', 'debt payoff calculator',
    'debt free calculator', 'credit card debt payoff plan', 'loan repayment strategy India',
    'total interest saved debt planner', 'fastest debt payoff method', 'debt reduction planner free',
  ],
  'portfolio-rebalance': [
    'portfolio rebalancer India', 'asset allocation rebalancing', 'equity debt rebalance calculator',
    'drift correction portfolio', 'buy sell to rebalance portfolio', 'target allocation tracker',
    'portfolio drift analysis', 'rebalance investment portfolio free', 'asset mix correction tool',
  ],
  'ctc-calc': [
    'CTC to in-hand salary calculator India', 'take home salary calculator', 'net salary from CTC',
    'old vs new tax regime comparison', 'EPF HRA standard deduction calculator',
    'monthly take home from CTC India', '87A rebate salary calculator', 'CTC breakup calculator',
    'gross to net salary India', 'in-hand salary after tax India',
  ],
  'hra-calc': [
    'HRA exemption calculator India', 'HRA tax exemption Section 10(13A)',
    'HRA calculation formula India', 'how much HRA is tax exempt',
    'HRA metro non-metro calculator', 'rent receipt HRA calculation',
    'actual HRA received vs paid rent', 'HRA three condition calculator India',
  ],
  'gratuity-calc': [
    'gratuity calculator India', 'gratuity payout formula', 'Payment of Gratuity Act calculator',
    'gratuity after 5 years', 'leave encashment calculator India', 'FnF gratuity calculation',
    'what is my gratuity amount', 'employer gratuity obligation India', 'earned leave encashment',
  ],
  'capital-gains-calc': [
    'capital gains tax calculator India', 'STCG LTCG calculator FY 2024-25',
    'long term capital gains calculator', 'short term capital gains tax India',
    'mutual fund capital gains calculator', 'equity shares LTCG calculator',
    'property capital gains tax India', 'gold capital gains calculator', 'indexation benefit calculator',
  ],
  'tax-saving-compare': [
    'NPS vs PPF vs ELSS comparison', '80C investment comparison India', 'best tax saving investment India',
    'ELSS vs PPF returns comparison', 'NPS vs ELSS which is better', 'tax saving instruments comparison',
    '80C section comparison calculator', 'EEE tax status investments India', 'tax saving 1.5 lakh options',
  ],
  'sub-audit': [
    'subscription tracker India', 'subscription audit tool', 'find all subscriptions',
    'monthly subscription cost calculator', 'cancel subscriptions India', 'OTT subscription tracker',
    'unused subscriptions finder', 'total annual subscription spend', 'manage all subscriptions',
  ],
  'wedding-budget': [
    'wedding budget planner India', 'wedding expense tracker', 'shaadi budget calculator',
    'wedding cost planner India', 'plan wedding budget online free', 'wedding vendor budget tracker',
    'venue catering photography budget', 'budgeted vs actual wedding expenses',
  ],
  'salary-nego': [
    'salary negotiation calculator India', 'is salary hike worth it after tax',
    'compare two salary offers India', 'take home difference salary offers',
    'CTC hike actual benefit calculator', 'salary offer comparison after tax India',
    'negotiate salary with numbers India', 'real salary increase after tax',
  ],
  'fd-calculator': [
    'FD calculator India', 'fixed deposit maturity calculator', 'RD calculator India',
    'recurring deposit calculator', 'FD returns with TDS', 'senior citizen FD calculator',
    'year wise FD growth chart', 'FD vs RD comparison', 'best FD calculator online India',
    'compound interest FD calculator',
  ],
  'nps-calculator': [
    'NPS calculator India', 'National Pension Scheme calculator', 'NPS corpus at retirement',
    'NPS equity debt allocation calculator', 'annuity income from NPS', '80CCD tax benefit NPS',
    'NPS vs PPF calculator', 'monthly NPS contribution calculator', 'NPS returns projection India',
  ],
  'ppf-calculator': [
    'PPF calculator India', 'Public Provident Fund maturity calculator', 'PPF 15 year growth chart',
    'PPF extension calculator India', 'EEE tax status PPF', 'PPF interest calculator FY 2024-25',
    'PPF partial withdrawal calculator', 'PPF deposit limit calculator', 'PPF vs FD vs ELSS',
  ],

  // ── GST & Tax ──────────────────────────────────────────────────────────────
  'tds-finder': [
    'TDS rate finder India', 'TDS percentage for salary', 'TDS on rent Section 194I',
    'TDS professional fees 194J', 'TDS contractor 194C', 'TDS threshold limit India FY 2024-25',
    'TDS rate for any payment India', 'section wise TDS rates', 'TDS on interest income',
    'check TDS applicable India', 'TDS rate lookup tool',
  ],
  'deduction-tracker': [
    'income tax deduction tracker India', '80C limit tracker', '80D health insurance deduction',
    '80CCD NPS deduction calculator', 'HRA deduction tracker', 'ITR deductions optimizer',
    'maximize tax savings India', 'tax deduction planner FY 2024-25', 'Section 80 investments tracker',
    'remaining 80C limit calculator',
  ],
  'tax-calendar': [
    'income tax due dates India', 'advance tax dates FY 2024-25', 'TDS deposit deadline India',
    'GST return due dates', 'ITR filing last date India', 'tax compliance calendar India',
    'GSTR-3B due date', 'advance tax quarterly dates', 'never miss tax deadline India',
  ],
  'advance-tax-calc': [
    'advance tax calculator India', 'advance tax installments FY 2024-25',
    'advance tax June September December March', 'quarterly advance tax calculator',
    'Section 208 advance tax', 'advance tax liability calculation India',
    'self assessment tax calculator', 'advance tax for salary income India',
  ],
  'income-tax-calc': [
    'income tax calculator India FY 2024-25', 'old vs new tax regime comparison India',
    'income tax slab calculator', 'tax calculation with HRA 80C India',
    '87A rebate calculator India', 'surcharge and cess income tax', 'take home after tax India',
    'income tax free online India', 'standard deduction income tax 2024',
  ],
  'itr-checklist': [
    'ITR filing checklist India', 'ITR document checklist', 'which ITR form to file India',
    'income tax return documents needed', 'ITR-1 ITR-2 ITR-3 selector', 'ITR preparation checklist',
    'documents for ITR filing salary', 'capital gains ITR checklist', 'rental income ITR documents',
  ],

  // ── Real Estate ────────────────────────────────────────────────────────────
  'home-loan-emi': [
    'home loan EMI calculator India', 'housing loan EMI calculator', 'home loan amortization schedule',
    'prepayment impact calculator home loan', 'home loan tenure reducer', 'part payment home loan benefit',
    'SBI HDFC ICICI home loan EMI', 'total interest home loan calculator India',
    'home loan vs rent calculator', 'reduce home loan tenure prepayment',
  ],
  'rent-vs-buy': [
    'rent vs buy calculator India', 'should I rent or buy India', 'rent vs buy breakeven analysis',
    'opportunity cost down payment calculator', 'property buying vs renting comparison India',
    '10 year rent vs buy comparison', 'real estate vs rent calculator India',
    'down payment opportunity cost', 'home buying decision calculator India',
  ],
  'rental-yield': [
    'rental yield calculator India', 'gross net rental yield', 'property rental return India',
    'is property investment worth it India', 'rental income ROI calculator',
    'compare rental yield vs FD', 'real estate returns calculator India',
    'annual rental yield percentage', 'property investment evaluation India',
  ],
  'stamp-duty': [
    'stamp duty calculator India', 'property registration charges India', 'state wise stamp duty India',
    'stamp duty Maharashtra', 'stamp duty Delhi', 'stamp duty Karnataka',
    'property purchase total cost India', 'registration charges calculator India',
    'stamp duty for flat purchase India', 'land registration fees calculator',
  ],
  'property-budget': [
    'property affordability calculator India', 'how much home can I afford India',
    'property purchase budget calculator', 'EMI to income ratio property India',
    'down payment requirement calculator India', 'maximum home loan eligibility India',
    'property budget planner India', 'total property cost calculator India',
  ],

  // ── Career ─────────────────────────────────────────────────────────────────
  'job-offer-compare': [
    'job offer comparison tool India', 'compare two job offers India', 'CTC comparison calculator',
    'job offer scorecard', 'which job offer is better India', 'job offer take home comparison',
    'compare job perks and CTC India', 'job switch decision tool', 'salary comparison two jobs India',
  ],
  'freelance-rate': [
    'freelance rate calculator India', 'hourly rate calculator freelancer', 'daily rate freelancer India',
    'minimum viable freelance rate', 'freelance pricing calculator', 'consultant rate calculator India',
    'freelance income after tax India', 'how to price freelance work India',
    'monthly income to hourly rate freelancer',
  ],
  'fnf-calculator': [
    'full and final settlement calculator India', 'FnF settlement calculator', 'FnF payout calculator India',
    'notice period pay calculation', 'gratuity in FnF settlement', 'leave encashment FnF India',
    'resignation FnF amount calculator', 'termination settlement calculator India',
    'PF settlement FnF India', 'last working day settlement amount',
  ],
  'wfh-savings': [
    'work from home savings calculator India', 'WFH vs office cost comparison',
    'how much I save working from home', 'commute cost calculator India',
    'remote work financial benefit India', 'WFH allowance value calculator',
    'office vs home food cost comparison', 'hybrid work financial impact India',
  ],
  'salary-history': [
    'salary growth tracker India', 'real salary growth after inflation', 'salary history log India',
    'career salary progression tracker', 'inflation adjusted salary growth', 'am I earning more India',
    'salary increment history chart', 'purchasing power salary India', 'career pay growth analyzer',
  ],
  'esop-value-calc': [
    'ESOP calculator India', 'RSU calculator India', 'employee stock option value calculator',
    'ESOP vesting schedule calculator', 'cliff vesting ESOP India', 'pre-tax post-tax ESOP value',
    'startup ESOP worth calculator', 'RSU value at vesting India', 'ESOP expected value calculator',
    'equity compensation calculator India',
  ],
  'career-roi-calc': [
    'MBA ROI calculator India', 'education ROI calculator', 'career investment payback period',
    'should I do MBA India', 'certification vs MBA salary India', 'NPV career investment',
    'course payback period calculator India', 'further education worth it India',
    '10 year earnings comparison MBA vs no MBA',
  ],

  // ── Startup ────────────────────────────────────────────────────────────────
  'burn-rate': [
    'startup burn rate calculator', 'runway calculator startup India', 'zero cash date calculator',
    'monthly burn rate tracker', 'fundraise planning calculator', 'startup cash runway India',
    'burn rate and runway dashboard', 'pre-seed seed runway calculator',
    'when should I raise funding', 'cash flow startup tracker',
  ],
  'equity-dilution': [
    'equity dilution simulator India', 'cap table calculator startup', 'founder dilution calculator',
    'funding round dilution model', 'ESOP pool dilution impact', 'Series A dilution calculator',
    'pre-post money valuation India', 'investor stake calculator startup',
    'cap table modeling tool India', 'startup equity ownership calculator',
  ],
  'saas-metrics': [
    'SaaS metrics calculator', 'MRR ARR calculator', 'LTV CAC ratio calculator',
    'churn rate calculator SaaS', 'LTV to CAC ratio tool', 'SaaS payback period calculator',
    'monthly recurring revenue calculator', 'SaaS dashboard metrics India',
    'SaaS financial health calculator', 'unit economics calculator SaaS',
  ],
  'project-pricing': [
    'freelance project pricing calculator India', 'agency project quote calculator',
    'project cost to client price', 'margin calculator freelance India',
    'GST project quote calculator', 'client quote generator India', 'project rate calculator',
    'service pricing calculator India', 'time and cost project estimator',
  ],

  // ── Travel ─────────────────────────────────────────────────────────────────
  'trip-budget': [
    'trip budget planner India', 'vacation budget calculator', 'travel expense planner',
    'budget travel India calculator', 'per person trip cost calculator',
    'holiday budget breakdown India', 'flights hotel food budget travel',
    'trip cost estimator India', 'family trip budget planner',
  ],
  'road-trip': [
    'road trip fuel cost calculator India', 'petrol cost road trip India',
    'distance fuel mileage cost calculator', 'road trip cost per person India',
    'highway trip fuel calculator', 'car road trip budget India',
    'fuel expense calculator India', 'trip distance fuel price calculator',
  ],
  'forex-calc': [
    'travel money calculator India', 'forex rate calculator India', 'convert INR to foreign currency travel',
    'credit card vs forex card fee comparison', 'travel currency calculator',
    'how much foreign currency to carry India', 'international travel money India',
    'USD EUR GBP travel budget from India', 'currency conversion travel India',
  ],
  'ev-vs-petrol': [
    'EV vs petrol cost comparison India', 'should I buy electric car India',
    'total cost of ownership EV petrol India', 'electric vehicle savings calculator India',
    'Tata Nexon EV vs petrol cost', 'EV charging vs fuel cost comparison India',
    '5 year car cost comparison India', 'is EV worth buying India',
  ],

  // ── CRM ────────────────────────────────────────────────────────────────────
  'crm-people': [
    'personal CRM free', 'relationship tracker app', 'contact follow-up tracker',
    'personal network manager', 'keep in touch reminder', 'local CRM no account',
    'people relationship manager India', 'interaction log contact tracker',
    'private CRM browser based', 'remember people details tool',
  ],
  'biz-crm-pipeline': [
    'business CRM free India', 'sales pipeline tracker', 'deal pipeline manager India',
    'client follow-up tracker', 'kanban sales board India', 'deal stage tracker',
    'CRM for small business India', 'sales CRM no signup', 'lead follow-up board India',
    'B2B CRM free online', 'deal management tool India',
  ],

  // ── Business OS ────────────────────────────────────────────────────────────
  'biz-dashboard': [
    'small business dashboard India', 'business overview dashboard free',
    'daily sales profit dashboard India', 'CEO dashboard small business India',
    'outstanding payments dashboard', 'low stock alert dashboard India',
    'real-time business KPIs India', 'profit and loss dashboard daily',
    'small shop business dashboard', 'dukaan dashboard online free India',
  ],
  'biz-daybook': [
    'digital daybook India', 'cash book online India', 'daily income expense entry India',
    'log business transactions daily', 'quick entry income expense India',
    'digital khata daybook', 'business cash register online free India',
    'daily petty cash book India', 'income expense logger small business India',
    'daily sales entry tool India',
  ],
  'biz-parties': [
    'Khata app online India', 'party ledger small business India', 'customer vendor ledger India',
    'receivables payables tracker India', 'digital Khata India free', 'who owes me money tracker India',
    'customer balance ledger India', 'vendor payment tracker India',
    'party register small business India', 'running balance ledger India',
  ],
  'biz-inventory': [
    'inventory management small business India', 'stock management tool free India',
    'live stock levels tracker India', 'low stock alert tool India',
    'product catalog with stock India', 'inventory tracker no signup India',
    'godown stock management India', 'product stock management free India',
    'supplier tracking inventory India', 'cost selling price product manager India',
  ],
  'biz-invoices': [
    'GST invoice manager India', 'GST invoice tracker India', 'invoice payment status tracker India',
    'mark invoice paid India', 'pending invoice tracker India', 'overdue invoice alerts India',
    'GST compliant invoice software free India', 'invoice management small business India',
    'track unpaid invoices India', 'auto daybook invoice payment India',
  ],
  'biz-reports': [
    'business P&L report India', 'profit and loss statement small business India',
    'business analytics report India', 'top customers by revenue India',
    'top products sales report India', 'monthly business trends India',
    'expense breakdown business India', 'small business financial report free India',
    'business income report India', 'P&L for small shop India',
  ],
  'biz-products': [
    'product catalog manager India', 'product master India small business',
    'HSN code product catalog India', 'GST rate product list India',
    'product pricing manager India', 'bulk import products CSV India',
    'product catalog free small business India', 'item master management India',
    'product cost selling price catalog India',
  ],
  'biz-stock-entry': [
    'stock entry management India', 'GRN goods received note India', 'stock inward outward entry India',
    'goods dispatched entry India', 'auto update stock India', 'stock movement tracker India',
    'purchase receipt stock update India', 'stock entry small business free India',
    'inventory adjustment India', 'material receipt entry India',
  ],
  'biz-outstanding': [
    'outstanding receivables tracker India', 'overdue payment tracker India',
    'aging analysis receivables India', 'who owes me money business India',
    'WhatsApp payment reminder generator India', 'accounts receivable tracker India',
    'unpaid invoice aging India', 'follow up receivables India',
    'overdue invoice list India', 'collections tracker small business India',
  ],
  'biz-purchases': [
    'purchase bill management India', 'vendor invoice tracker India', 'accounts payable tracker India',
    'ITC input tax credit tracker India', 'purchase register India small business',
    'vendor payment due tracker India', 'purchase entry tool India',
    'record vendor bills India', 'ITC eligible purchases India',
  ],
  'biz-quotations': [
    'quotation maker India', 'estimate generator India free', 'business quote maker India',
    'quotation to invoice conversion India', 'client estimate tracker India',
    'quote win loss tracker India', 'professional quotation India free',
    'quotation management small business India', 'send estimate to client India',
  ],
  'biz-staff': [
    'staff management India small business', 'employee attendance tracker India',
    'payroll calculator India small business', 'PF ESI deduction calculator India',
    'monthly salary calculator India', 'employee records manager India',
    'daily attendance mark India', 'salary slip generator small business India',
    'staff payroll India free', 'manpower management tool India',
  ],
  'biz-gst': [
    'GST filing helper India', 'GSTR-1 preparation tool India', 'GSTR-3B calculator India',
    'output tax tracker India', 'ITC input tax credit summary India',
    'net GST payable calculator India', 'GST compliance helper India free',
    'GST filing small business India', 'monthly GST summary India',
    'outward supplies GSTR-1 India',
  ],
  'biz-cashflow': [
    'business cash flow forecast India', '30 60 90 day cash flow projection India',
    'cash flow planner small business India', 'future cash position India',
    'receivables based cash forecast India', 'business liquidity planner India',
    'cash crunch predictor India', 'invoice based cash forecast India',
    'working capital forecast India',
  ],
  'biz-loans': [
    'business loan tracker India', 'business EMI schedule India', 'company loan payment tracker India',
    'outstanding business loan India', 'business debt tracker India',
    'loan repayment history business India', 'mark loan payment India',
    'multiple business loans tracker India', 'business borrowing tracker India',
  ],
  'biz-reconcile': [
    'bank reconciliation India small business', 'bank statement daybook matching India',
    'reconcile bank account India', 'unrecorded transactions finder India',
    'bank statement discrepancy tool India', 'daybook vs bank statement India',
    'cash book reconciliation India', 'BRS bank reconciliation statement India',
  ],

  // ── Business Documents ─────────────────────────────────────────────────────
  'invoice-generator': [
    'GST invoice generator India free', 'tax invoice maker India', 'create GST invoice online free',
    'CGST SGST invoice India', 'GSTIN invoice generator', 'GST bill maker India',
    'invoice PDF download India free', 'B2B invoice generator India', 'HSN code invoice India',
    'professional invoice India no signup', 'billing software free India',
  ],
  'salary-slip': [
    'salary slip generator India free', 'payslip maker India', 'salary slip PDF download India',
    'HRA PF TDS salary slip India', 'monthly payslip generator India', 'employee salary slip maker',
    'CTC salary breakup India', 'salary statement generator India free', 'payslip format India',
    'salary slip with all components India',
  ],
  'smart-agreement': [
    'legal contract generator India free', 'NDA generator India', 'service agreement template India',
    'freelance contract maker India', 'legal document generator free India',
    'rent agreement template India', 'business agreement creator India',
    'contract template India no signup', 'legal contract creator online India',
  ],
  'id-card': [
    'employee ID card maker India free', 'ID card generator online India', 'company ID card creator',
    'ID card with photo India', 'QR code ID card India', 'staff ID card generator India',
    'bulk ID card maker India', 'custom ID card online India', 'employee badge maker India',
  ],
  'rent-receipt': [
    'rent receipt generator India free', 'rent receipt for HRA India', 'rental receipt maker India',
    'HRA rent receipt PDF India', 'landlord rent receipt India', 'monthly rent receipt PDF',
    'rent receipt with revenue stamp India', 'rent receipt download India free',
  ],

  // ── Documents & Files ──────────────────────────────────────────────────────
  'universal-converter': [
    'file converter online free', 'document converter free', 'convert file format online',
    'PDF to Word converter free', 'Word to PDF converter', 'DOCX to PDF online',
    'convert 50 file formats', 'batch file converter online', 'online converter no signup',
    'audio video document converter', 'file format converter browser',
  ],
  'smart-scan': [
    'document scanner online free', 'scan document with camera', 'mobile document scanner',
    'scan to PDF online', 'document scan app browser', 'photo to PDF scanner online',
    'auto crop document scan', 'enhance scanned document', 'webcam document scanner',
  ],
  'smart-pdf-merge': [
    'merge PDF online free', 'combine PDF files free', 'join PDF online', 'PDF merger no signup',
    'combine multiple PDFs online', 'PDF combiner free', 'merge PDF no watermark',
    'reorder PDF pages online', 'add pages to PDF free', 'merge PDF instantly',
  ],
  'smart-pdf-split': [
    'split PDF online free', 'extract PDF pages', 'PDF splitter free online', 'split PDF by page range',
    'separate PDF pages online', 'PDF page extractor free', 'cut PDF into parts',
    'divide PDF file online', 'PDF split no signup', 'extract specific pages PDF',
  ],
  'smart-img-compress': [
    'compress image online free', 'reduce image size free', 'image compressor no signup',
    'shrink image file size online', 'optimize image for web', 'compress JPG PNG WebP free',
    'batch image compressor online', 'reduce photo size online', 'image size reducer free',
    'compress image without quality loss',
  ],
  'smart-img-convert': [
    'image converter online free', 'PNG to JPG converter', 'JPG to WebP converter',
    'convert image format free', 'WebP converter online', 'AVIF image converter',
    'batch image format converter', 'image format changer no signup', 'GIF converter online free',
    'convert image free no upload limit',
  ],
  'smart-ocr': [
    'OCR online free', 'image to text converter', 'extract text from image online',
    'scanned document to text free', 'photo to text converter', 'OCR tool no signup',
    'picture to text online', 'text recognition online free', 'PDF to text OCR',
    'Hindi OCR online', 'handwriting to text OCR free',
  ],
  'smart-word': [
    'markdown editor online free', 'markdown live preview editor', 'markdown to HTML converter',
    'markdown to PDF export', 'markdown converter online', 'write markdown in browser',
    'markdown renderer free', 'live markdown editor no signup', 'markdown to Word export',
  ],
  'smart-excel': [
    'CSV editor online free', 'edit CSV in browser', 'CSV viewer online', 'spreadsheet online free',
    'CSV filter tool', 'online data editor CSV', 'edit CSV without Excel', 'CSV transform tool',
    'CSV spreadsheet editor browser', 'CSV formula tool online',
  ],
  'json-csv': [
    'JSON to CSV converter', 'CSV to JSON converter', 'convert JSON CSV online',
    'flatten nested JSON to CSV', 'JSON CSV transformer free', 'parse JSON to spreadsheet',
    'JSON array to CSV', 'CSV to JSON free online', 'JSON CSV tool no signup',
  ],
  'self-serve-analytics': [
    'CSV chart builder free', 'paste CSV get chart', 'CSV data visualizer',
    'no-code analytics tool', 'CSV to bar chart online', 'CSV to line chart',
    'data visualization from CSV free', 'instant CSV chart maker', 'CSV statistics tool',
    'upload CSV create chart', 'CSV trend analysis online',
  ],

  // ── Developer ──────────────────────────────────────────────────────────────
  'dev-station': [
    'all-in-one developer tools online', 'developer toolkit browser', 'coding utility tools free',
    'Base64 encoder decoder online', 'URL encoder decoder', 'UUID generator online',
    'developer swiss knife browser', 'web developer tools free no signup', 'encoding decoding tools',
    'HTML entities encoder', 'dev tools all in one browser',
  ],
  'api-playground': [
    'API tester online free', 'REST API playground browser', 'test API online no signup',
    'HTTP request tester browser', 'API testing tool free', 'Postman alternative free online',
    'REST client browser based', 'test GET POST PUT DELETE API', 'API response visualizer',
    'API client no install', 'browser based API tester',
  ],
  'smart-jwt': [
    'JWT decoder online free', 'JWT debugger browser', 'decode JWT token online',
    'JWT token inspector', 'JSON web token decoder free', 'verify JWT online',
    'JWT payload viewer', 'JWT token analyzer', 'decode JWT header payload signature',
    'JWT claims inspector', 'JWT debugging tool free',
  ],
  'smart-json': [
    'JSON formatter online free', 'JSON beautifier', 'JSON validator online',
    'format JSON online', 'JSON editor browser', 'JSON pretty print free',
    'JSON syntax checker', 'JSON tree view online', 'fix JSON format online',
    'JSON linter free', 'minify JSON online',
  ],
  'smart-sql': [
    'SQL formatter online free', 'SQL beautifier', 'format SQL query online',
    'SQL pretty print free', 'SQL indenter online', 'beautify SQL query free',
    'SQL code formatter no signup', 'clean SQL online', 'MySQL PostgreSQL formatter',
    'SQL keyword casing formatter',
  ],
  'cron-gen': [
    'cron expression generator online', 'cron job builder free', 'cron schedule maker',
    'crontab generator online', 'cron expression tester', 'next cron run time calculator',
    'cron syntax visual editor', 'cron expression explainer', 'cron schedule planner free',
  ],
  'git-cheats': [
    'git commands cheat sheet', 'git reference guide online', 'git commands list with examples',
    'git cheatsheet browser', 'common git commands copy paste', 'git quick reference free',
    'git tutorial command reference', 'git beginner guide', 'learn git commands online',
  ],
  'smart-diff': [
    'text diff tool online free', 'compare two texts online', 'text comparison tool browser',
    'diff checker online free', 'find text differences online', 'side by side text compare',
    'code diff tool online', 'text diff no signup', 'compare file contents online',
  ],
  'regex-tester': [
    'regex tester online free', 'regular expression tester live', 'test regex online',
    'regex checker browser', 'live regex match highlighter', 'regex debugger online',
    'test regular expression free', 'regex groups capture viewer', 'regex replace online',
    'regex syntax tester', 'regex pattern matcher free',
  ],
  'hash-gen': [
    'hash generator online free', 'MD5 hash generator', 'SHA256 hash generator online',
    'SHA512 hash calculator', 'checksum calculator free', 'file hash generator browser',
    'text to hash online', 'SHA1 generator online', 'verify file hash online',
    'generate hash string free', 'hash algorithm tool browser',
  ],
  'num-convert': [
    'number base converter online', 'binary to decimal converter', 'hex to binary converter',
    'decimal to hexadecimal online', 'octal converter free', 'number system converter browser',
    'binary decimal hex octal converter', 'convert between number bases free',
    'binary calculator online', 'programmer calculator base converter',
  ],
  'timestamp-tool': [
    'unix timestamp converter online', 'timestamp to date free', 'epoch converter browser',
    'convert unix timestamp online', 'unix time to human date', 'date to timestamp converter',
    'epoch time converter free', 'milliseconds to date online', 'ISO date to epoch converter',
    'multi timezone timestamp tool',
  ],

  // ── Productivity ───────────────────────────────────────────────────────────
  'life-os': [
    'life OS planner online free', 'goals habits tasks planner browser', 'personal life organizer',
    'GTD life planner online', 'habit goal task daily planner', 'life management tool free',
    'online daily life organizer India', 'personal productivity system browser',
    'life planning tool no signup', 'weekly review planner online',
  ],
  'qr-code': [
    'QR code generator free India', 'create QR code online free', 'QR code maker no signup',
    'QR code for URL link', 'WiFi QR code generator', 'UPI QR code generator India',
    'contact vCard QR code', 'custom QR code online free', 'download QR code PNG',
    'WhatsApp QR code generator India', 'free QR generator no account',
  ],
  'smart-pass': [
    'password generator free online', 'strong password generator', 'secure password creator browser',
    'random password generator no signup', 'create complex password online',
    'cryptographic password generator', 'bulk password generator', 'password strength checker',
    'generate 16 character password free', 'password generator with special characters',
  ],
  pomodoro: [
    'Pomodoro timer online free', 'focus timer browser', '25 minute work timer',
    'Pomodoro technique timer no signup', 'productivity timer online', 'study timer browser',
    'work break timer online', 'Pomodoro app no download', 'focus productivity timer free',
    'tomato timer online', 'deep work timer browser',
  ],
  'task-planner': [
    'personal task manager free online', 'GTD task planner browser', 'GTD inbox capture tool',
    'task organizer by project area', 'daily work planner online free', 'capture organize tasks browser',
    'task planning system no signup India', 'GTD-lite browser tool', 'daily tasks prioritization tool',
    'next action list manager online',
  ],
  'habit-tracker': [
    'habit tracker free online', '21 day habit tracker browser', 'build habits daily tracker',
    'habit streak counter online', 'daily habit completion tracker', 'habit formation tool free',
    'no signup habit tracker browser', 'habit calendar grid online', 'habit tracker India free',
    'morning routine habit tracker',
  ],
  'lang-translate': [
    'language translator online free', 'text translator 35 languages', 'auto detect language translate',
    'voice input translator online', 'file translation online free', 'translate document online free',
    'Hindi English translator online', 'multilingual translator browser', 'website translator tool',
    'free translator no signup', 'Google Translate alternative',
  ],

  // ── Converters ─────────────────────────────────────────────────────────────
  'unit-convert': [
    'unit converter online free', 'length weight temperature converter', 'metric to imperial converter',
    'kg to lbs converter online', 'cm to inches converter', 'Celsius to Fahrenheit converter',
    'volume area speed converter online', 'unit conversion tool India free',
    '20 measurement types converter', 'all units converter browser',
  ],
  'case-convert': [
    'text case converter online free', 'uppercase lowercase converter', 'title case converter browser',
    'camelCase snake_case converter', 'kebab-case converter online', 'SCREAMING_SNAKE_CASE converter',
    'PascalCase converter free', 'sentence case tool online', 'change text case instantly',
    'text transformer case free',
  ],

  // ── Design ─────────────────────────────────────────────────────────────────
  'color-picker': [
    'color picker online free', 'HEX RGB HSL color picker', 'color palette generator free',
    'WCAG contrast ratio checker', 'web color picker browser', 'convert HEX to RGB online',
    'convert RGB to HSL free', 'color code picker browser', 'accessible color contrast tool',
    'color accessibility WCAG checker', 'complementary color palette generator',
  ],
  'color-studio': [
    'CSS gradient generator free', 'linear gradient CSS maker', 'radial gradient generator online',
    'conic gradient tool browser', 'gradient background maker free', 'copy CSS gradient code',
    'gradient color picker online', 'live gradient preview CSS', 'gradient presets collection',
    'UI background gradient tool free', 'gradient design tool browser',
  ],

  // ── Health ─────────────────────────────────────────────────────────────────
  'smart-bmi': [
    'BMI calculator India free', 'body mass index calculator online', 'calculate BMI free',
    'healthy weight range calculator India', 'BMI chart for adults India', 'ideal weight calculator India',
    'overweight obese BMI calculator', 'BMI for Indian body type', 'weight category calculator free',
  ],
  'smart-breath': [
    'box breathing exercise online', 'guided breathing 4-4-4-4', 'breathing timer browser free',
    'stress relief breathing exercise online', 'calm anxiety breathing tool',
    'deep breathing guided exercise', 'relaxation breathing technique online',
    '4 count breathing exercise free', 'mindful breathing tool browser',
  ],
  'smart-workout': [
    'HIIT timer online free', 'interval training timer browser', 'tabata timer free online',
    'custom workout interval timer', 'HIIT workout timer no app', 'exercise timer browser free',
    'fitness interval timer online', 'rest work timer HIIT', 'audio cue workout timer browser',
    'customizable HIIT timer free',
  ],
  'calorie-calculator': [
    'calorie calculator India free', 'BMR calculator India', 'TDEE calculator free online',
    'daily calorie target weight loss India', 'macro calculator India', 'protein carbs fat split calculator',
    'calorie deficit calculator India', 'weight loss calorie calculator free India',
    'BMR TDEE calculator metric India', 'calorie goal calculator free',
  ],
  'water-tracker': [
    'water intake tracker free online', 'daily water tracker browser', 'how much water to drink calculator',
    'hydration tracker free India', 'water drink reminder tool browser', '8 glasses water tracker',
    'daily water goal tracker free', 'hydration streak tracker', 'water intake daily goal India',
  ],

  // ── AI Tools ───────────────────────────────────────────────────────────────
  'prompt-generator': [
    'AI prompt generator free', 'ChatGPT prompt builder online', 'Claude prompt generator',
    'prompt engineering tool free', 'LLM prompt creator browser', 'generate AI prompts online',
    'prompt template generator free', 'best prompt for ChatGPT', 'AI writing prompt generator',
    'prompt ideas for LLMs free', 'prompt optimizer online',
  ],
  'smart-chat': [
    'AI chat assistant free online', 'AI chatbot no signup', 'chat with AI browser free',
    'AI writing assistant online', 'AI coding assistant browser', 'free AI chat no login',
    'ChatGPT alternative free online', 'AI conversation tool browser', 'AI brainstorm tool free',
    'AI assistant no account', 'AI chat for research free',
  ],
  'smart-analyze': [
    'text sentiment analyzer online free', 'sentiment analysis tool browser', 'detect text tone online',
    'positive negative neutral analyzer', 'review sentiment analysis free', 'tone analyzer online',
    'social media sentiment tool free', 'feedback analyzer online', 'text emotion detector browser',
    'NLP sentiment tool free', 'analyze customer reviews sentiment',
  ],

  // ── Creator ────────────────────────────────────────────────────────────────
  'audio-transcription': [
    'audio to text transcription free', 'speech to text online browser', 'voice to text free online',
    'transcribe audio online free India', 'microphone to text browser', 'audio transcription no signup',
    'real time speech to text browser', 'record and transcribe online free',
    'Hindi speech to text online', 'multilingual audio transcription free',
  ],
  'video-downloader': [
    'video downloader online free', 'YouTube video downloader', 'Instagram video downloader',
    'Twitter X video download', 'TikTok video downloader free', 'Facebook video downloader',
    'Reddit video downloader', 'Vimeo video downloader free', 'download social media videos',
    'no watermark video downloader', 'free video download no signup',
  ],
  'instagram-transcript': [
    'video to text transcript free', 'transcribe video file online', 'video transcript generator browser',
    'upload video get transcript', 'AI video transcription free', 'video subtitle generator online',
    'Instagram Reel transcript', 'YouTube video transcript generator free',
    'video to text with timestamps', 'video content to text online free',
  ],

  // ── Writer's OS ─────────────────────────────────────────────────────────────
  'writer-ideas': [
    'writing idea capture tool free', 'blog idea board online', 'content idea organizer free',
    'idea management tool for writers', 'blog post idea generator', 'writing prompt idea board',
    'content ideas capture app browser', 'never lose writing idea tool', 'idea to blog post workflow',
    'writing inspiration board free no signup',
  ],
  'writer-planner': [
    'blog post outline builder free', 'content outline tool online', 'blog structure planner browser',
    'how to structure a blog post tool', 'story plot planner free', '3-act story structure tool online',
    "hero's journey planner free", 'blog template outline generator', 'writing outline tool no signup',
    'article structure planner free for bloggers',
  ],
  'writer-studio': [
    'distraction-free writing app online free', 'online text editor no account', 'minimalist writing tool browser',
    'writing app no signup free', 'blog post writing tool online', 'free writing software browser-based',
    'word count writing goal tracker', 'document editor auto-save browser', 'online writer no login',
    'write online save locally free',
  ],
  'writer-analyzer': [
    'writing quality checker free online', 'readability score checker free', 'Flesch-Kincaid score calculator online',
    'passive voice checker free', 'filler word checker writing', 'improve writing quality tool free',
    'blog post readability analyzer', 'writing feedback tool free no login', 'sentence complexity checker',
    'writing score calculator browser free',
  ],
  'writer-headline': [
    'headline analyzer free online', 'blog title score checker', 'headline score tool for bloggers',
    'power words headline tool free', 'blog post title optimizer', 'headline CTR improvement tool',
    'title tag analyzer free', 'headline score out of 100 free', 'click-worthy headline generator',
    'headline analyzer no signup browser',
  ],
  'writer-export': [
    'export blog post markdown free', 'convert article to LinkedIn post', 'Twitter thread generator from blog',
    'blog to markdown converter free', 'article to HTML export tool', 'download blog post as PDF free',
    'content repurposing tool free online', 'blog export to text markdown html', 'LinkedIn post formatter free',
    'Twitter thread splitter tool free no signup',
  ],
};

// Category-level fallback keywords (used when no tool-specific entry exists)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'My Finance': ['personal finance India', 'bank statement analysis', 'financial tracker India', 'money management India free', 'financial calculator India', 'savings calculator India', 'GST calculator India', 'income tax India', 'tax compliance tool India', 'ITR filing India'],
  Analytics:    ['data analytics tool', 'bank statement analysis', 'transaction analytics', 'financial insights'],
  'My Business':['small business accounting India', 'GST billing India', 'Khata app India', 'business management India free'],
  Business:     ['business document generator India', 'GST compliant India', 'professional document India', 'small business tool free'],
  Documents:    ['PDF tool online free', 'document converter browser', 'file converter online', 'convert files browser'],
  Developer:    ['developer tool online free', 'coding utility browser', 'web developer tool free', 'programming tool browser'],
  Productivity: ['productivity tool free online', 'task organizer browser', 'time management tool', 'daily planner browser'],
  Converters:   ['online converter free', 'unit conversion tool', 'format converter browser', 'measurement converter'],
  Design:       ['design tool online free', 'CSS tool browser', 'color tool free', 'UI design tool browser'],
  Health:       ['health calculator free India', 'fitness tool online', 'wellness calculator browser', 'health tracker free'],
  Career:       ['career calculator India', 'salary tool India', 'job tools India free', 'career planning India'],
  'Real Estate':['property calculator India', 'home loan calculator India', 'real estate tool India', 'property tools India'],
  Startup:      ['startup tool India free', 'founder calculator', 'SaaS metrics tool', 'startup finance India'],
  Travel:       ['travel calculator India', 'trip planner tool India', 'vacation budget India', 'travel cost calculator'],
  'Personal CRM':['personal CRM free', 'relationship tracker browser', 'contact manager free', 'network tracker'],
  'Business CRM':['business CRM India free', 'sales pipeline tool', 'deal tracker India', 'CRM small business free'],
  AI:           ['AI tool free online', 'artificial intelligence tool browser', 'AI assistant free', 'AI no signup'],
  Creator:      ['content creator tool free', 'media tool online free', 'creator utility browser', 'video audio tool free'],
  "Writer's OS":['writing tool free online', 'blog writing workspace browser', 'writing app no signup', 'content creation tool free'],
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
  // Place a 1200×630 PNG at /public/og-image.png for rich social previews.
  // Tool-specific OG images can be placed at /public/og/[tool-id].png when available.
  const toolOgImage = `${baseUrl}/og/${tool.id}.png`;
  const defaultOgImage = `${baseUrl}/og-image.png`;
  return {
    title: `${tool.name} - Free Online Tool | OneTool`,
    description: generateSEODescription(tool),
    url: `${baseUrl}${tool.href}`,
    siteName: 'OneTool',
    type: 'website' as const,
    images: [
      {
        url: toolOgImage,
        fallback: defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${tool.name} — Free Online Tool by OneTool`,
      },
    ],
  };
}

export function generateTwitterCard(tool: Tool, baseUrl: string) {
  const defaultOgImage = `${baseUrl}/og-image.png`;
  return {
    card: 'summary_large_image' as const,
    title: `${tool.name} - Free Online Tool | OneTool`,
    description: generateSEODescription(tool),
    images: [defaultOgImage],
  };
}
