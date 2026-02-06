/**
 * Search Utilities
 * Enhanced fuzzy search with keyword synonyms for better matching
 */

export interface SearchItem {
  id: string;
  title: string;
  category?: string;
  [key: string]: unknown;
}

/**
 * Keyword synonyms for better search matching
 * Maps common search terms to tool-related keywords
 */
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  // Finance terms
  'money': ['budget', 'finance', 'loan', 'sip', 'net worth', 'retirement', 'gst'],
  'budget': ['money', 'planner', 'expense', 'finance', 'spending'],
  'loan': ['emi', 'interest', 'mortgage', 'calculator', 'finance'],
  'emi': ['loan', 'calculator', 'interest', 'finance'],
  'investment': ['sip', 'retirement', 'net worth', 'finance'],
  'tax': ['gst', 'calculator', 'finance', 'income'],
  'salary': ['slip', 'payroll', 'hr', 'pay', 'income'],
  'payslip': ['salary', 'slip', 'hr'],

  // Document terms
  'pdf': ['document', 'merge', 'split', 'convert', 'workbench'],
  'file': ['document', 'convert', 'converter', 'pdf', 'image'],
  'image': ['picture', 'photo', 'compress', 'convert', 'resize'],
  'photo': ['image', 'picture', 'compress', 'convert'],
  'picture': ['image', 'photo', 'compress'],
  'compress': ['reduce', 'minimize', 'image', 'size'],
  'convert': ['transform', 'change', 'converter', 'format'],
  'scan': ['ocr', 'document', 'smart'],
  'ocr': ['scan', 'text', 'extract', 'recognize'],
  'excel': ['csv', 'spreadsheet', 'data', 'table'],
  'csv': ['excel', 'data', 'table', 'json'],
  'word': ['markdown', 'document', 'text', 'editor'],
  'markdown': ['md', 'word', 'document', 'text'],

  // Business terms
  'invoice': ['bill', 'receipt', 'payment', 'business'],
  'bill': ['invoice', 'receipt', 'payment'],
  'receipt': ['bill', 'invoice', 'rent', 'payment'],
  'contract': ['agreement', 'legal', 'nda', 'document'],
  'agreement': ['contract', 'legal', 'nda'],
  'nda': ['contract', 'agreement', 'legal', 'confidential'],
  'id': ['identity', 'card', 'badge', 'employee'],
  'card': ['id', 'identity', 'badge'],
  'rent': ['receipt', 'hra', 'property', 'landlord'],
  'hra': ['rent', 'receipt', 'tax'],

  // Developer terms
  'code': ['developer', 'programming', 'json', 'api', 'dev'],
  'developer': ['dev', 'code', 'programming', 'api'],
  'dev': ['developer', 'code', 'programming'],
  'api': ['rest', 'playground', 'developer', 'test'],
  'json': ['data', 'format', 'developer', 'csv', 'editor'],
  'jwt': ['token', 'auth', 'decode', 'debugger'],
  'token': ['jwt', 'auth', 'security'],
  'sql': ['database', 'query', 'format'],
  'database': ['sql', 'data', 'query'],
  'git': ['version', 'command', 'developer'],
  'cron': ['schedule', 'job', 'timer', 'generator'],
  'diff': ['compare', 'text', 'difference'],
  'compare': ['diff', 'text', 'difference'],
  'terminal': ['devstation', 'console', 'developer'],

  // Productivity terms
  'timer': ['pomodoro', 'clock', 'time', 'countdown'],
  'pomodoro': ['timer', 'focus', 'productivity', 'work'],
  'calendar': ['planner', 'schedule', 'life', 'organize'],
  'planner': ['calendar', 'life', 'organize', 'schedule'],
  'qr': ['code', 'generator', 'barcode', 'scan'],
  'barcode': ['qr', 'code', 'scan'],
  'password': ['pass', 'generator', 'security', 'random'],
  'pass': ['password', 'generator', 'security'],

  // Health terms
  'health': ['bmi', 'fitness', 'workout', 'breathing'],
  'bmi': ['health', 'weight', 'body', 'calculator'],
  'weight': ['bmi', 'health', 'body', 'fitness'],
  'fitness': ['workout', 'hiit', 'exercise', 'health'],
  'workout': ['fitness', 'hiit', 'exercise', 'timer'],
  'hiit': ['workout', 'timer', 'fitness', 'exercise'],
  'breathing': ['breath', 'box', 'relax', 'meditation'],
  'breath': ['breathing', 'box', 'relax'],
  'meditation': ['breathing', 'relax', 'calm'],

  // Converter terms
  'unit': ['convert', 'converter', 'measure', 'calculation'],
  'measure': ['unit', 'convert', 'calculator'],
  'case': ['text', 'convert', 'upper', 'lower', 'capitalize'],
  'text': ['case', 'convert', 'string', 'editor'],

  // Design terms
  'color': ['colour', 'picker', 'hex', 'rgb', 'design'],
  'colour': ['color', 'picker', 'hex', 'rgb'],
  'picker': ['color', 'select', 'choose'],
  'hex': ['color', 'rgb', 'code'],
  'rgb': ['color', 'hex', 'code'],

  // AI terms
  'ai': ['artificial', 'intelligence', 'chat', 'smart', 'ml'],
  'chat': ['ai', 'conversation', 'assistant', 'gpt'],
  'gpt': ['ai', 'chat', 'assistant'],
  'prompt': ['ai', 'generator', 'template'],
  'sentiment': ['analyze', 'emotion', 'text', 'ai'],

  // Analytics terms
  'analytics': ['data', 'report', 'chart', 'analysis', 'dashboard'],
  'report': ['analytics', 'data', 'chart', 'dashboard'],
  'chart': ['graph', 'analytics', 'data', 'visualization'],
  'graph': ['chart', 'analytics', 'visualization'],
  'data': ['analytics', 'csv', 'excel', 'table'],
  'expense': ['expenses', 'spending', 'transaction', 'money'],
  'expenses': ['expense', 'spending', 'transaction', 'debit'],
  'income': ['credit', 'earnings', 'transaction', 'money'],
  'credit': ['income', 'transaction', 'deposit'],
  'transaction': ['expense', 'income', 'bank', 'statement'],
  'bank': ['transaction', 'statement', 'finance'],
  'statement': ['bank', 'transaction', 'upload'],

  // Audio terms
  'audio': ['transcription', 'voice', 'speech', 'record'],
  'transcription': ['audio', 'text', 'voice', 'speech'],
  'voice': ['audio', 'speech', 'record'],
  'speech': ['voice', 'audio', 'text'],

  // Common action words
  'create': ['generate', 'make', 'build', 'generator'],
  'generate': ['create', 'make', 'build', 'generator'],
  'make': ['create', 'generate', 'build'],
  'build': ['create', 'make', 'generate'],
  'edit': ['modify', 'change', 'editor', 'update'],
  'modify': ['edit', 'change', 'update'],
  'calculate': ['calculator', 'compute', 'math'],
  'calculator': ['calculate', 'compute', 'math'],

  // Typos and common misspellings
  'invoce': ['invoice'],
  'recept': ['receipt'],
  'calulator': ['calculator'],
  'convertor': ['converter'],
  'genrator': ['generator'],
  'expences': ['expenses'],
  'transation': ['transaction'],
  'analytic': ['analytics'],
  'formater': ['formatter'],
};

/**
 * Expand query with synonyms
 */
function expandQueryWithSynonyms(query: string): string[] {
  const words = query.toLowerCase().trim().split(/\s+/);
  const expandedTerms = new Set<string>(words);

  for (const word of words) {
    // Add direct synonyms
    const synonyms = KEYWORD_SYNONYMS[word];
    if (synonyms) {
      synonyms.forEach(s => expandedTerms.add(s));
    }

    // Also check partial matches for longer queries
    for (const [key, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
      if (key.includes(word) || word.includes(key)) {
        expandedTerms.add(key);
        synonyms.forEach(s => expandedTerms.add(s));
      }
    }
  }

  return Array.from(expandedTerms);
}

/**
 * Calculate match score for ranking results
 */
function calculateMatchScore(
  item: SearchItem,
  query: string,
  expandedTerms: string[]
): number {
  const title = (item.title || '').toLowerCase();
  const category = (item.category || '').toLowerCase();
  const q = query.toLowerCase();
  let score = 0;

  // Exact title match - highest score
  if (title === q) {
    score += 100;
  }

  // Title starts with query
  if (title.startsWith(q)) {
    score += 50;
  }

  // Title contains exact query
  if (title.includes(q)) {
    score += 30;
  }

  // Category matches
  if (category.includes(q)) {
    score += 20;
  }

  // Synonym matches in title
  for (const term of expandedTerms) {
    if (title.includes(term)) {
      score += 10;
    }
    if (category.includes(term)) {
      score += 5;
    }
  }

  // Fuzzy character sequence match
  const pattern = q.split('').join('.*');
  const regex = new RegExp(pattern, 'i');
  if (regex.test(title)) {
    score += 15;
  }

  return score;
}

/**
 * Enhanced fuzzy search with synonym expansion and ranking
 * Matches even with mismatched keywords using synonym mapping
 */
export function fuzzySearch<T extends SearchItem>(
  items: T[],
  query: string,
  keys: (keyof T)[] = ['title', 'category'] as (keyof T)[]
): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;

  // Expand query with synonyms
  const expandedTerms = expandQueryWithSynonyms(q);

  // Build regex patterns for all terms
  const patterns = expandedTerms.map(term => {
    const pattern = term.split('').join('.*');
    return new RegExp(pattern, 'i');
  });

  // Also create a direct pattern for the original query
  const directPattern = new RegExp(q.split('').join('.*'), 'i');

  // Filter and score items
  const scored = items
    .map((item) => {
      let matches = false;

      // Check direct query match
      for (const key of keys) {
        const val = item[key];
        if (typeof val === 'string') {
          if (directPattern.test(val)) {
            matches = true;
            break;
          }
          // Check expanded terms
          for (const pattern of patterns) {
            if (pattern.test(val)) {
              matches = true;
              break;
            }
          }
          // Check if any synonym term is contained
          for (const term of expandedTerms) {
            if (val.toLowerCase().includes(term)) {
              matches = true;
              break;
            }
          }
        }
        if (matches) break;
      }

      if (!matches) return null;

      const score = calculateMatchScore(item, q, expandedTerms);
      return { item, score };
    })
    .filter((result): result is { item: T; score: number } => result !== null)
    .sort((a, b) => b.score - a.score);

  return scored.map((s) => s.item);
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const suggestions = new Set<string>();

  // Find synonyms that start with or contain the query
  for (const [key, synonyms] of Object.entries(KEYWORD_SYNONYMS)) {
    if (key.startsWith(q) || key.includes(q)) {
      suggestions.add(key);
      synonyms.slice(0, 2).forEach(s => suggestions.add(s));
    }
  }

  return Array.from(suggestions).slice(0, 5);
}
