'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Plus, Trash2, GripVertical,
  ChevronDown, ChevronRight, PenLine, Target,
  BookOpen, Film, Zap
} from 'lucide-react';
import WriterNav from './shared/WriterNav';
import {
  loadWriterStore, onWriterStoreUpdate, updateDocument,
  getActiveDocument, OutlineSection, WriterStore
} from './writer-store';

type PlanMode = 'outline' | 'story';
type StoryFramework = '3act' | 'heros';

const BLOG_TEMPLATES = [
  { id: 'how-to', label: 'How-To Guide', sections: ['Introduction', 'Prerequisites', 'Step 1', 'Step 2', 'Step 3', 'Common Mistakes', 'Conclusion'] },
  { id: 'listicle', label: 'Listicle', sections: ['Introduction', 'Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5', 'Summary'] },
  { id: 'opinion', label: 'Opinion / Essay', sections: ['Hook', 'Thesis', 'Argument 1', 'Argument 2', 'Counterargument', 'Rebuttal', 'Conclusion'] },
  { id: 'case-study', label: 'Case Study', sections: ['Overview', 'The Problem', 'Our Approach', 'Execution', 'Results', 'Key Takeaways'] },
  { id: 'comparison', label: 'Comparison', sections: ['Introduction', 'Overview A', 'Overview B', 'Feature Comparison', 'Pros & Cons', 'Our Verdict'] },
];

const STORY_FRAMEWORKS = {
  '3act': {
    label: '3-Act Structure',
    acts: [
      { act: 'Act I — Setup', beats: ['Ordinary World', 'Inciting Incident', 'Call to Adventure', 'Refusal / Acceptance'] },
      { act: 'Act II — Confrontation', beats: ['Rising Action', 'Midpoint Twist', 'Dark Night of the Soul', 'Climax Build-up'] },
      { act: 'Act III — Resolution', beats: ['Climax', 'Falling Action', 'Resolution', 'New Normal'] },
    ],
  },
  heros: {
    label: "Hero's Journey",
    acts: [
      { act: 'Departure', beats: ['Ordinary World', 'Call to Adventure', 'Refusal of the Call', 'Meeting the Mentor', 'Crossing the Threshold'] },
      { act: 'Initiation', beats: ['Tests, Allies, Enemies', 'Approach to the Inmost Cave', 'Ordeal', 'Reward (Seizing the Sword)'] },
      { act: 'Return', beats: ['The Road Back', 'Resurrection', 'Return with the Elixir'] },
    ],
  },
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export default function WriterPlanner() {
  const [store, setStore] = useState<WriterStore | null>(null);
  const [mode, setMode] = useState<PlanMode>('outline');
  const [storyFramework, setStoryFramework] = useState<StoryFramework>('3act');
  const [storyNotes, setStoryNotes] = useState<Record<string, string>>({});
  const [keyword, setKeyword] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const reload = useCallback(() => setStore(loadWriterStore()), []);
  useEffect(() => { reload(); return onWriterStoreUpdate(reload); }, [reload]);

  const doc = store ? getActiveDocument(store) : null;
  const outline: OutlineSection[] = doc?.outline ?? [];

  const saveOutline = (sections: OutlineSection[]) => {
    if (!doc) return;
    updateDocument(doc.id, { outline: sections });
  };

  const applyTemplate = (templateId: string) => {
    const tmpl = BLOG_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    const sections: OutlineSection[] = tmpl.sections.map((s, i) => ({
      id: uid(),
      heading: s,
      notes: '',
      wordTarget: 150,
      order: i,
    }));
    saveOutline(sections);
  };

  const addSection = () => {
    const newSection: OutlineSection = {
      id: uid(),
      heading: 'New Section',
      notes: '',
      wordTarget: 150,
      order: outline.length,
    };
    saveOutline([...outline, newSection]);
  };

  const updateSection = (id: string, changes: Partial<OutlineSection>) => {
    saveOutline(outline.map((s) => s.id === id ? { ...s, ...changes } : s));
  };

  const deleteSection = (id: string) => {
    saveOutline(outline.filter((s) => s.id !== id));
  };

  const moveSection = (fromIdx: number, toIdx: number) => {
    const arr = [...outline];
    const [removed] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, removed);
    saveOutline(arr.map((s, i) => ({ ...s, order: i })));
  };

  const totalWordTarget = outline.reduce((sum, s) => sum + s.wordTarget, 0);

  const handleStoryNote = (key: string, val: string) => {
    const updated = { ...storyNotes, [key]: val };
    setStoryNotes(updated);
    // Save to doc notes field
    if (doc) {
      updateDocument(doc.id, { tags: doc.tags }); // trigger re-save
    }
  };

  const framework = STORY_FRAMEWORKS[storyFramework];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <WriterNav />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Content Planner</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {doc ? doc.title : 'No document selected'} · Plan before you write
            </p>
          </div>

          {/* Mode switcher */}
          <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setMode('outline')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
                ${mode === 'outline' ? 'bg-amber-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <BookOpen size={14} /> Blog Outline
            </button>
            <button
              onClick={() => setMode('story')}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
                ${mode === 'story' ? 'bg-amber-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <Film size={14} /> Story Canvas
            </button>
          </div>
        </div>

        {!doc ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutDashboard size={48} className="text-amber-300 dark:text-amber-700 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a document in Studio first.</p>
            <a href="/tools/writer/writer-studio" className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              Go to Studio <ChevronRight size={14} />
            </a>
          </div>
        ) : mode === 'outline' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Template picker */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Quick Templates
                </h3>
                <div className="space-y-1.5">
                  {BLOG_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl.id)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {tmpl.label}
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({tmpl.sections.length} sections)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus keyword */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Focus Keyword / Angle
                </h3>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. productivity for freelancers"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600"
                />
              </div>

              {/* Stats */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Outline Stats</span>
                </div>
                <div className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  <div className="flex justify-between"><span>Sections</span><span className="font-bold">{outline.length}</span></div>
                  <div className="flex justify-between"><span>Target words</span><span className="font-bold">{totalWordTarget.toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            {/* Right: Sections */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sections</h2>
                <button
                  onClick={addSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus size={13} /> Add Section
                </button>
              </div>

              {outline.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-xl text-sm text-gray-400 dark:text-gray-500">
                  Choose a template or add a section to begin
                </div>
              ) : (
                <div className="space-y-2">
                  {outline.map((section, idx) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => setDragIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { if (dragIdx !== null && dragIdx !== idx) moveSection(dragIdx, idx); setDragIdx(null); }}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 cursor-grab text-gray-300 dark:text-gray-600 group-hover:text-gray-400">
                          <GripVertical size={16} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 w-5 shrink-0">
                              H{idx + 2}
                            </span>
                            <input
                              value={section.heading}
                              onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                              className="flex-1 text-sm font-semibold bg-transparent border-none outline-none text-gray-800 dark:text-gray-100"
                            />
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                              <Target size={11} />
                              <input
                                type="number"
                                value={section.wordTarget}
                                onChange={(e) => updateSection(section.id, { wordTarget: parseInt(e.target.value) || 150 })}
                                className="w-12 bg-transparent text-center border-b border-gray-200 dark:border-gray-700 focus:outline-none text-xs"
                              />
                              <span>words</span>
                            </div>
                            <button
                              onClick={() => deleteSection(section.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <textarea
                            value={section.notes}
                            onChange={(e) => updateSection(section.id, { notes: e.target.value })}
                            placeholder="Notes, key points, research to include…"
                            rows={2}
                            className="w-full text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2 py-1.5 resize-none focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {outline.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <a
                    href="/tools/writer/writer-studio"
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <PenLine size={14} /> Start writing in Studio
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Story Canvas */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">Framework:</span>
              {(Object.keys(STORY_FRAMEWORKS) as StoryFramework[]).map((fw) => (
                <button
                  key={fw}
                  onClick={() => setStoryFramework(fw)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${storyFramework === fw
                      ? 'bg-amber-500 text-white'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-300'
                    }`}
                >
                  {STORY_FRAMEWORKS[fw].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {framework.acts.map((actData) => (
                <div key={actData.act} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-3">
                    {actData.act}
                  </h3>
                  <div className="space-y-3">
                    {actData.beats.map((beat) => (
                      <div key={beat}>
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">{beat}</label>
                        <textarea
                          value={storyNotes[`${actData.act}__${beat}`] ?? ''}
                          onChange={(e) => handleStoryNote(`${actData.act}__${beat}`, e.target.value)}
                          placeholder="Your notes…"
                          rows={2}
                          className="w-full text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:border-amber-300 dark:focus:border-amber-700 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
