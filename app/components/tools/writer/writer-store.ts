/**
 * Writer's OS — Shared Data Store
 * Key: 'otsd-writer-store'
 * Pattern mirrors finance-store.ts and biz-os-store.ts
 */

const STORE_KEY = 'otsd-writer-store';
const STORE_EVENT = 'otsd-writer-store-updated';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocStatus = 'idea' | 'draft' | 'in-progress' | 'complete';

export interface WriterDocument {
  id: string;
  title: string;
  content: string;
  wordCountGoal: number;
  status: DocStatus;
  tags: string[];
  outline: OutlineSection[];
  headline: string; // current working headline
  createdAt: number;
  updatedAt: number;
}

export interface OutlineSection {
  id: string;
  heading: string;
  notes: string;
  wordTarget: number;
  order: number;
}

export interface WriterIdea {
  id: string;
  text: string;
  tags: string[];
  linkedDocId?: string; // if developed into a doc
  createdAt: number;
}

export interface WriterStore {
  documents: WriterDocument[];
  ideas: WriterIdea[];
  activeDocId: string | null;
  version: number;
}

// ─── Default ──────────────────────────────────────────────────────────────────

function defaultStore(): WriterStore {
  return {
    documents: [],
    ideas: [],
    activeDocId: null,
    version: 1,
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

export function loadWriterStore(): WriterStore {
  if (typeof window === 'undefined') return defaultStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultStore();
    return { ...defaultStore(), ...JSON.parse(raw) };
  } catch {
    return defaultStore();
  }
}

export function saveWriterStore(store: WriterStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function onWriterStoreUpdate(cb: () => void): () => void {
  window.addEventListener(STORE_EVENT, cb);
  return () => window.removeEventListener(STORE_EVENT, cb);
}

// ─── ID generation ────────────────────────────────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Documents ────────────────────────────────────────────────────────────────

export function createDocument(
  partial: Partial<Pick<WriterDocument, 'title' | 'content' | 'wordCountGoal' | 'tags' | 'headline'>>
): WriterDocument {
  const store = loadWriterStore();
  const doc: WriterDocument = {
    id: uid(),
    title: partial.title || 'Untitled',
    content: partial.content || '',
    wordCountGoal: partial.wordCountGoal || 1000,
    status: 'draft',
    tags: partial.tags || [],
    outline: [],
    headline: partial.headline || partial.title || 'Untitled',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store.documents.unshift(doc);
  store.activeDocId = doc.id;
  saveWriterStore(store);
  return doc;
}

export function updateDocument(id: string, changes: Partial<WriterDocument>): void {
  const store = loadWriterStore();
  const idx = store.documents.findIndex((d) => d.id === id);
  if (idx === -1) return;
  store.documents[idx] = { ...store.documents[idx], ...changes, updatedAt: Date.now() };
  saveWriterStore(store);
}

export function deleteDocument(id: string): void {
  const store = loadWriterStore();
  store.documents = store.documents.filter((d) => d.id !== id);
  if (store.activeDocId === id) {
    store.activeDocId = store.documents[0]?.id ?? null;
  }
  saveWriterStore(store);
}

export function setActiveDoc(id: string | null): void {
  const store = loadWriterStore();
  store.activeDocId = id;
  saveWriterStore(store);
}

export function getActiveDocument(store: WriterStore): WriterDocument | null {
  if (!store.activeDocId) return store.documents[0] ?? null;
  return store.documents.find((d) => d.id === store.activeDocId) ?? store.documents[0] ?? null;
}

// ─── Ideas ────────────────────────────────────────────────────────────────────

export function addIdea(text: string, tags: string[] = []): WriterIdea {
  const store = loadWriterStore();
  const idea: WriterIdea = {
    id: uid(),
    text,
    tags,
    createdAt: Date.now(),
  };
  store.ideas.unshift(idea);
  saveWriterStore(store);
  return idea;
}

export function deleteIdea(id: string): void {
  const store = loadWriterStore();
  store.ideas = store.ideas.filter((i) => i.id !== id);
  saveWriterStore(store);
}

export function developIdea(ideaId: string): WriterDocument {
  const store = loadWriterStore();
  const idea = store.ideas.find((i) => i.id === ideaId);
  if (!idea) throw new Error('Idea not found');

  // Link idea → doc
  const doc = createDocument({ title: idea.text.slice(0, 60), content: '' });

  // Mark idea as linked
  const iIdx = store.ideas.findIndex((i) => i.id === ideaId);
  if (iIdx !== -1) {
    const s2 = loadWriterStore(); // reload after createDocument saved
    s2.ideas[iIdx] = { ...s2.ideas[iIdx], linkedDocId: doc.id };
    saveWriterStore(s2);
  }

  return doc;
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

export function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function getCharCount(text: string): number {
  return text.length;
}

export function getReadingTime(text: string): number {
  // ~200 wpm reading speed → minutes
  return Math.max(1, Math.ceil(getWordCount(text) / 200));
}

export function getSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getFleschScore(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 10) return 0;
  const sentences = getSentences(text);
  if (sentences.length === 0) return 0;

  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 2) return 1;
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    if (word.endsWith('e')) count -= 1;
    return Math.max(1, count);
  };

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSentenceLen = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const score = 206.835 - 1.015 * avgSentenceLen - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getPassiveVoiceCount(text: string): number {
  const beVerbs = /\b(am|is|are|was|were|be|been|being)\b/gi;
  const pastParticiple = /\b\w+(ed|en|t)\b/gi;
  const sentences = getSentences(text);
  let count = 0;
  for (const s of sentences) {
    if (beVerbs.test(s)) {
      beVerbs.lastIndex = 0;
      if (pastParticiple.test(s)) count++;
      pastParticiple.lastIndex = 0;
    }
  }
  return count;
}

export const FILLER_WORDS = [
  'very', 'really', 'quite', 'basically', 'actually', 'literally',
  'just', 'simply', 'honestly', 'obviously', 'clearly', 'of course',
  'needless to say', 'in order to', 'due to the fact that',
  'at the end of the day', 'it is what it is', 'going forward',
];

export function getFillerWordCount(text: string): number {
  const lower = text.toLowerCase();
  return FILLER_WORDS.reduce((sum, fw) => {
    const re = new RegExp(`\\b${fw.replace(/ /g, '\\s+')}\\b`, 'gi');
    const matches = lower.match(re);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

export function getLongSentences(text: string, threshold = 30): string[] {
  return getSentences(text).filter((s) => s.split(/\s+/).length > threshold);
}

export function getWritingScore(text: string): number {
  if (getWordCount(text) < 10) return 0;
  const flesch = getFleschScore(text);
  const sentences = getSentences(text);
  const passiveRatio = sentences.length > 0 ? getPassiveVoiceCount(text) / sentences.length : 0;
  const fillerRatio = getWordCount(text) > 0 ? getFillerWordCount(text) / getWordCount(text) : 0;
  const longRatio = sentences.length > 0 ? getLongSentences(text).length / sentences.length : 0;

  // Weighted score
  const score =
    (flesch / 100) * 50 +
    (1 - Math.min(1, passiveRatio * 3)) * 20 +
    (1 - Math.min(1, fillerRatio * 20)) * 15 +
    (1 - Math.min(1, longRatio * 3)) * 15;

  return Math.round(Math.max(0, Math.min(100, score)));
}

// ─── Headline helpers ─────────────────────────────────────────────────────────

const POWER_WORDS = [
  'ultimate', 'proven', 'secret', 'powerful', 'simple', 'instant',
  'surprising', 'essential', 'complete', 'free', 'new', 'easy',
  'best', 'top', 'amazing', 'incredible', 'effortless', 'master',
  'boost', 'transform', 'unlock', 'discover', 'learn', 'guide',
];

export function scoreHeadline(headline: string): {
  total: number;
  powerWords: number;
  length: number;
  hasNumber: boolean;
  sentiment: number;
  clarity: number;
} {
  const words = headline.toLowerCase().split(/\s+/);
  const charLen = headline.length;

  const powerCount = words.filter((w) => POWER_WORDS.includes(w)).length;
  const powerScore = Math.min(30, powerCount * 10);

  // Ideal length: 6-12 words, 40-70 chars
  const wordLen = words.length;
  const lengthScore =
    wordLen >= 6 && wordLen <= 12 && charLen >= 40 && charLen <= 70 ? 25 :
    wordLen >= 5 && wordLen <= 15 ? 15 : 5;

  const hasNumber = /\d/.test(headline);
  const numberScore = hasNumber ? 15 : 0;

  // Simple sentiment: presence of positive or negative charged words
  const positiveWords = ['best', 'great', 'amazing', 'incredible', 'easy', 'proven', 'free', 'boost', 'win'];
  const sentimentCount = words.filter((w) => positiveWords.includes(w)).length;
  const sentimentScore = Math.min(15, sentimentCount * 8);

  // Clarity: no jargon / not too long
  const clarityScore = charLen <= 80 ? 15 : charLen <= 100 ? 8 : 3;

  const total = Math.min(100, powerScore + lengthScore + numberScore + sentimentScore + clarityScore);

  return {
    total,
    powerWords: powerCount,
    length: lengthScore,
    hasNumber,
    sentiment: sentimentScore,
    clarity: clarityScore,
  };
}
