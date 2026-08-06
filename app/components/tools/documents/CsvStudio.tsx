"use client";
import React, { useState, useMemo } from 'react';
import {
  Trash2, FileJson, Plus, Table2, FileText, X,
  Upload, Search, BarChart2, ArrowUpDown, Download
} from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

function parseCSV(raw: string) {
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 1) return { headers: [], rows: [] };
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delim).map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = lines.slice(1)
    .map(l => l.split(delim).map(c => c.replace(/^["']|["']$/g, '').trim()))
    .filter(r => r.some(c => c !== ''));
  return { headers, rows };
}

function parseJSON(raw: string) {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const headers = Object.keys(arr[0]);
    const rows = arr.map(obj => headers.map(h => String(obj[h] ?? '')));
    return { headers, rows };
  } catch { return null; }
}

export const CsvStudio = () => {
  const [headers, setHeaders] = useState(["ID", "Name", "Role", "Email", "Department"]);
  const [data, setData] = useState([
    ["1", "Alice Chen", "Engineer", "alice@example.com", "Engineering"],
    ["2", "Bob Smith", "Designer", "bob@example.com", "Design"],
    ["3", "Carol White", "Manager", "carol@example.com", "Operations"],
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<'table' | 'stats'>('table');

  // Handlers
  const handleHeader = (i: number, v: string) => {
    const n = [...headers]; n[i] = v; setHeaders(n);
  };
  const handleCell = (r: number, c: number, v: string) => {
    const n = [...data]; n[r] = [...n[r]]; n[r][c] = v; setData(n);
  };
  const addRow = () => setData([...data, Array(headers.length).fill('')]);
  const addCol = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setData(data.map(row => [...row, '']));
  };
  const deleteRow = (i: number) => setData(data.filter((_, x) => x !== i));
  const deleteCol = (i: number) => {
    setHeaders(headers.filter((_, x) => x !== i));
    setData(data.map(row => row.filter((_, x) => x !== i)));
  };
  const removeEmpty = () => {
    const clean = data.filter(row => row.some(c => c.trim() !== ''));
    setData(clean);
    showToast(`Removed ${data.length - clean.length} empty rows`, 'success');
  };
  const clearAll = () => {
    setHeaders(["Column 1", "Column 2", "Column 3"]);
    setData([Array(3).fill('')]);
    showToast('Table cleared', 'info');
  };

  // Import
  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      let parsed;
      if (f.name.endsWith('.json')) {
        parsed = parseJSON(text);
        if (!parsed) { showToast('Invalid JSON — expected array of objects', 'error'); return; }
      } else {
        parsed = parseCSV(text);
      }
      if (parsed.headers.length === 0) { showToast('No data found in file', 'error'); return; }
      setHeaders(parsed.headers);
      setData(parsed.rows);
      showToast(`Imported ${parsed.rows.length} rows from ${f.name}`, 'success');
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  // Sort
  const handleSort = (col: number) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  // Filtered + sorted data
  const displayData = useMemo(() => {
    let rows = [...data];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(r => r.some(c => c.toLowerCase().includes(q)));
    }
    if (sortCol !== null) {
      rows.sort((a, b) => {
        const av = a[sortCol] || ''; const bv = b[sortCol] || '';
        const numA = Number(av.replace(/[,₹$€£]/g, ''));
        const numB = Number(bv.replace(/[,₹$€£]/g, ''));
        const cmp = (!isNaN(numA) && !isNaN(numB)) ? numA - numB : av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, searchQuery, sortCol, sortDir]);

  // Column stats
  const colStats = useMemo(() => headers.map((_, ci) => {
    const vals = data.map(r => r[ci] || '');
    const nonEmpty = vals.filter(v => v.trim() !== '');
    const nums = nonEmpty.map(v => Number(v.replace(/[,₹$€£\s]/g, ''))).filter(n => !isNaN(n));
    const unique = new Set(nonEmpty).size;
    return {
      total: vals.length,
      filled: nonEmpty.length,
      empty: vals.length - nonEmpty.length,
      unique,
      numeric: nums.length,
      sum: nums.length > 0 ? nums.reduce((a, b) => a + b, 0) : null,
      avg: nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null,
    };
  }), [data, headers]);

  const exportFile = (type: 'csv' | 'json') => {
    let content = '', mime = '', ext = '';
    if (type === 'json') {
      const json = data.map(row => headers.reduce((acc: Record<string, string>, h, i) => { acc[h] = row[i] || ''; return acc; }, {}));
      content = JSON.stringify(json, null, 2); mime = 'application/json'; ext = 'json';
    } else {
      content = headers.join(',') + '\n' + data.map(r => r.map(c => c.includes(',') ? `"${c}"` : c).join(',')).join('\n');
      mime = 'text/csv'; ext = 'csv';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `data.${ext}`; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported as ${ext.toUpperCase()}`, 'success');
  };

  const filteredCount = displayData.length;
  const totalCount = data.length;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-lg"><Table2 size={16} className="text-teal-600"/></div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">Data Studio</span>
          <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-semibold">CSV / JSON</span>
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            {filteredCount !== totalCount ? `${filteredCount}/${totalCount}` : totalCount} rows
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            {headers.length} cols
          </span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-[280px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search rows..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={11}/>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Tab buttons */}
          <button onClick={() => setActiveTab('table')}
            className={`px-2.5 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1 transition-colors ${activeTab === 'table' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <Table2 size={12}/> Table
          </button>
          <button onClick={() => setActiveTab('stats')}
            className={`px-2.5 py-1.5 text-xs rounded-lg font-semibold flex items-center gap-1 transition-colors ${activeTab === 'stats' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            <BarChart2 size={12}/> Stats
          </button>
        </div>

        <div className="flex-1"/>

        {/* Actions */}
        <button onClick={addRow} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors">
          <Plus size={12}/> Row
        </button>
        <button onClick={addCol} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors">
          <Plus size={12}/> Col
        </button>
        <button onClick={removeEmpty} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors">
          <Trash2 size={12}/> Clean
        </button>
        <button onClick={clearAll} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 flex items-center gap-1 transition-colors">
          <X size={12}/> Clear
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"/>

        {/* Import */}
        <label className="cursor-pointer px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700">
          <Upload size={12}/> Import
          <input type="file" accept=".csv,.json" className="hidden" onChange={importFile}/>
        </label>

        {/* Export */}
        <button onClick={() => exportFile('csv')} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors">
          <Download size={12}/> CSV
        </button>
        <button onClick={() => exportFile('json')} className="px-2.5 py-1.5 text-xs rounded-lg font-bold text-white bg-teal-600 hover:bg-teal-700 flex items-center gap-1 transition-colors">
          <FileJson size={12}/> JSON
        </button>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      {activeTab === 'table' ? (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="w-8 px-2 py-2 text-center text-xs text-slate-400 font-mono border-r border-slate-200 dark:border-slate-700">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="p-0 min-w-[120px] border-r border-slate-200 dark:border-slate-700 last:border-r-0 group relative">
                    <div className="flex items-center">
                      <input
                        value={h}
                        onChange={e => handleHeader(i, e.target.value)}
                        className="flex-1 px-2.5 py-2 bg-transparent outline-none text-xs font-bold uppercase text-slate-600 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                        placeholder="HEADER"
                      />
                      <button onClick={() => handleSort(i)} title="Sort by this column"
                        className={`p-1 mr-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0 ${sortCol === i ? 'text-teal-600' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'}`}>
                        <ArrowUpDown size={10}/>
                      </button>
                      <button onClick={() => deleteCol(i)} title="Delete column"
                        className="p-1 mr-1 text-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                        <X size={10}/>
                      </button>
                    </div>
                  </th>
                ))}
                <th className="w-8"/>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 2} className="text-center py-16 text-slate-400 text-sm">
                    {searchQuery ? 'No rows match your search' : 'Table is empty — add a row to start'}
                  </td>
                </tr>
              ) : (
                displayData.map((row, r) => {
                  const origIdx = data.indexOf(row);
                  return (
                    <tr key={r} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                      <td className="px-2 py-1 text-center text-xs text-slate-300 dark:text-slate-600 font-mono select-none group-hover:text-slate-500 border-r border-slate-100 dark:border-slate-800">
                        {origIdx + 1}
                      </td>
                      {row.map((cell, c) => (
                        <td key={c} className="p-0 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                          <input
                            value={cell}
                            onChange={e => {
                              if (origIdx >= 0) handleCell(origIdx, c, e.target.value);
                            }}
                            className="w-full px-2.5 py-1.5 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 focus:bg-blue-50 dark:focus:bg-blue-900/10 focus:text-blue-700 dark:focus:text-blue-300 transition-all"
                          />
                        </td>
                      ))}
                      <td className="px-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => origIdx >= 0 && deleteRow(origIdx)}
                          className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                          title="Delete row"
                        >
                          <X size={12}/>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Stats View ── */
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {headers.map((h, i) => {
              const s = colStats[i];
              return (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500 flex-shrink-0"/>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide truncate">{h}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Filled</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{s.filled}/{s.total}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Unique values</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{s.unique}</span>
                    </div>
                    {s.sum !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Sum</span>
                        <span className="font-semibold text-teal-600">{s.sum.toFixed(2)}</span>
                      </div>
                    )}
                    {s.avg !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Average</span>
                        <span className="font-semibold text-teal-600">{s.avg.toFixed(2)}</span>
                      </div>
                    )}
                    {/* Fill rate bar */}
                    <div className="pt-1">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${s.total > 0 ? (s.filled / s.total) * 100 : 0}%` }}/>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
