'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Lightbulb, Plus, Trash2, ArrowRight, Tag, X,
  Search, Flame, Clock, Link
} from 'lucide-react';
import WriterNav from './shared/WriterNav';
import {
  loadWriterStore, onWriterStoreUpdate, addIdea, deleteIdea, developIdea,
  WriterStore, WriterIdea
} from './writer-store';

const PROMPT_SUGGESTIONS = [
  'What problem am I uniquely qualified to write about?',
  'What do beginners always get wrong in my niche?',
  'What opinion do I hold that most people disagree with?',
  "What's the one lesson from my work I wish I knew 5 years ago?",
  'What topic do people constantly ask me about?',
  'What myth in my field needs to be debunked?',
  'What skill changed my life and how?',
  'What would I teach a friend starting from zero?',
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WriterIdeas() {
  const [store, setStore] = useState<WriterStore | null>(null);
  const [input, setInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [developing, setDeveloping] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const reload = useCallback(() => setStore(loadWriterStore()), []);
  useEffect(() => { reload(); return onWriterStoreUpdate(reload); }, [reload]);

  // Rotate prompts every 8s
  useEffect(() => {
    const interval = setInterval(() => setPromptIdx((i) => (i + 1) % PROMPT_SUGGESTIONS.length), 8000);
    return () => clearInterval(interval);
  }, []);

  const ideas: WriterIdea[] = store?.ideas ?? [];

  // All unique tags
  const allTags = [...new Set(ideas.flatMap((i) => i.tags))];

  // Filtered ideas
  const filtered = ideas.filter((idea) => {
    const matchSearch = search ? idea.text.toLowerCase().includes(search.toLowerCase()) : true;
    const matchTag = activeTag ? idea.tags.includes(activeTag) : true;
    return matchSearch && matchTag;
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    addIdea(input.trim(), pendingTags);
    setInput('');
    setPendingTags([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const addPendingTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !pendingTags.includes(tag)) {
      setPendingTags((prev) => [...prev, tag]);
    }
    setTagInput('');
  };

  const handleDevelop = (ideaId: string) => {
    setDeveloping(ideaId);
    try {
      developIdea(ideaId);
      // Navigate to studio
      window.location.href = '/tools/writer/writer-studio';
    } catch {
      setDeveloping(null);
    }
  };

  const randomPrompt = () => {
    setPromptIdx((i) => (i + 1) % PROMPT_SUGGESTIONS.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <WriterNav />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Idea Board</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {ideas.length} ideas captured · Never lose a thought
            </p>
          </div>
        </div>

        {/* Quick capture */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 shadow-sm">
          {/* Writing prompt */}
          <div
            className="mb-3 flex items-start gap-2 cursor-pointer group"
            onClick={randomPrompt}
            title="Click for another prompt"
          >
            <Flame size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600 dark:text-amber-400 italic group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              "{PROMPT_SUGGESTIONS[promptIdx]}"
            </p>
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture an idea… (⌘+Enter to save)"
            rows={3}
            className="w-full text-base bg-transparent border-none outline-none resize-none text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
            {/* Tag input */}
            <div className="flex items-center gap-1 flex-wrap flex-1">
              <Tag size={12} className="text-gray-400 shrink-0" />
              {pendingTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded text-xs">
                  {tag}
                  <button onClick={() => setPendingTags((p) => p.filter((t) => t !== tag))}><X size={9} /></button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPendingTag(); } }}
                placeholder="+ tag"
                className="text-xs px-1.5 py-0.5 border border-dashed border-amber-300 dark:border-amber-700 rounded bg-transparent text-amber-700 dark:text-amber-300 placeholder:text-amber-400 focus:outline-none w-14 focus:w-24 transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={14} /> Capture
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        {ideas.length > 0 && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-amber-300 dark:focus:border-amber-700"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveTag(null)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  !activeTag ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    activeTag === tag ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ideas grid */}
        {filtered.length === 0 && ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Lightbulb size={48} className="text-amber-300 dark:text-amber-700 mb-3" />
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Your idea board is empty</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
              Every great piece of writing starts with a spark. Start capturing yours above.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">
            No ideas match your search or filter.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {filtered.map((idea) => (
              <div
                key={idea.id}
                className="break-inside-avoid mb-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 group hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-md transition-all"
              >
                {/* Idea text */}
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                  {idea.text}
                </p>

                {/* Tags */}
                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {idea.tags.map((tag) => (
                      <span key={tag} className="text-[11px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Linked doc badge */}
                {idea.linkedDocId && (
                  <div className="flex items-center gap-1 mb-2 text-xs text-blue-600 dark:text-blue-400">
                    <Link size={10} /> Developed into a document
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <Clock size={10} /> {timeAgo(idea.createdAt)}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="p-1 rounded text-red-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                    {!idea.linkedDocId && (
                      <button
                        onClick={() => handleDevelop(idea.id)}
                        disabled={developing === idea.id}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {developing === idea.id ? 'Opening…' : <>Develop <ArrowRight size={11} /></>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
