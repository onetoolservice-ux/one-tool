'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, Copy, Check, FileText, Code2,
  Linkedin, Twitter, FileCode, Eye, ChevronRight
} from 'lucide-react';
import WriterNav from './shared/WriterNav';
import {
  loadWriterStore, onWriterStoreUpdate, getActiveDocument,
  getWordCount, getReadingTime, WriterStore
} from './writer-store';

type ExportFormat = 'plain' | 'markdown' | 'html' | 'linkedin' | 'twitter';

function toMarkdown(title: string, content: string): string {
  return `# ${title}\n\n${content}`;
}

function toHtml(title: string, content: string): string {
  const escapedContent = content
    .split('\n\n')
    .map((para) => `<p>${para.trim().replace(/\n/g, '<br />')}</p>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 2rem auto; line-height: 1.7; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    p { margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${escapedContent}
</body>
</html>`;
}

function toLinkedIn(title: string, content: string): string {
  // LinkedIn format: hook line, body paragraphs (short), CTA
  const paragraphs = content.split('\n\n').filter(Boolean);
  const hook = paragraphs[0] ?? title;
  const body = paragraphs.slice(1, 5).join('\n\n');
  const cta = '💡 What do you think? Share your thoughts in the comments.';
  return `${hook}\n\n${body}\n\n${cta}\n\n#Writing #Content #Productivity`;
}

function toTwitterThreads(title: string, content: string): string[] {
  const MAX = 280;
  const words = content.split(' ');
  const threads: string[] = [];
  let current = `🧵 ${title}\n\n`;

  for (const word of words) {
    if ((current + word).length > MAX - 10) {
      threads.push(current.trim());
      current = word + ' ';
    } else {
      current += word + ' ';
    }
  }
  if (current.trim()) threads.push(current.trim());

  return threads.map((t, i) => `${i + 1}/${threads.length} ${t}`);
}

const FORMAT_TABS: { id: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { id: 'plain', label: 'Plain Text', icon: <FileText size={14} /> },
  { id: 'markdown', label: 'Markdown', icon: <Code2 size={14} /> },
  { id: 'html', label: 'HTML', icon: <FileCode size={14} /> },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={14} /> },
  { id: 'twitter', label: 'Twitter Thread', icon: <Twitter size={14} /> },
];

export default function WriterExport() {
  const [store, setStore] = useState<WriterStore | null>(null);
  const [format, setFormat] = useState<ExportFormat>('plain');
  const [copied, setCopied] = useState(false);

  const reload = useCallback(() => setStore(loadWriterStore()), []);
  useEffect(() => { reload(); return onWriterStoreUpdate(reload); }, [reload]);

  const doc = store ? getActiveDocument(store) : null;
  const title = doc?.title ?? 'Untitled';
  const content = doc?.content ?? '';
  const wordCount = getWordCount(content);
  const readingTime = getReadingTime(content);

  const getExportContent = (): string => {
    if (!doc) return '';
    switch (format) {
      case 'plain': return `${title}\n\n${content}`;
      case 'markdown': return toMarkdown(title, content);
      case 'html': return toHtml(title, content);
      case 'linkedin': return toLinkedIn(title, content);
      case 'twitter': return toTwitterThreads(title, content).join('\n\n---\n\n');
    }
  };

  const getTwitterThreads = (): string[] => {
    if (!doc) return [];
    return toTwitterThreads(title, content);
  };

  const exportContent = getExportContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!doc) return;
    const ext = format === 'plain' ? 'txt' : format === 'markdown' ? 'md' : format === 'html' ? 'html' : 'txt';
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(format === 'html' ? exportContent : toHtml(title, content));
    win.document.close();
    win.print();
  };

  const twitterThreads = format === 'twitter' ? getTwitterThreads() : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <WriterNav />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Export & Publish</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {doc ? `${title} · ${wordCount.toLocaleString()} words · ${readingTime} min read` : 'No document selected'}
            </p>
          </div>

          {doc && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {copied ? <><Check size={14} className="text-green-500" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
              {(format === 'plain' || format === 'markdown' || format === 'html') && (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download size={14} /> Download
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye size={14} /> Print / PDF
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {!doc || !content ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Download size={48} className="text-amber-300 dark:text-amber-700 mb-3" />
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Nothing to export yet</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
              Write your document in the Studio first, then export it in any format.
            </p>
            <a href="/tools/writer/writer-studio" className="mt-3 flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
              Go to Studio <ChevronRight size={14} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Format tabs (left column on lg) */}
            <div className="lg:col-span-1 space-y-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Format</p>
              {FORMAT_TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                    ${format === id
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900 hover:shadow-sm'
                    }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="lg:col-span-3">
              {format === 'twitter' ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Thread Preview ({twitterThreads.length} tweets)
                  </p>
                  {twitterThreads.map((tweet, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{tweet}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${tweet.length > 260 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                              {tweet.length}/280
                            </span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(tweet); }}
                              className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                            >
                              <Copy size={11} /> Copy tweet
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : format === 'linkedin' ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Linkedin size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">LinkedIn Post Preview</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Formatted for maximum engagement</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {exportContent}
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {title.replace(/\s+/g, '-').toLowerCase()}.{format === 'plain' ? 'txt' : format === 'markdown' ? 'md' : 'html'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{exportContent.length} chars</span>
                  </div>
                  <pre className="p-5 text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-auto max-h-[60vh]">
                    {exportContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
