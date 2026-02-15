'use client';

import { useState, type ReactNode } from 'react';
import {
  ChevronDown, ChevronUp, ChevronRight, ArrowUpDown, Trash2,
  FileDown, CheckSquare, Square, Check
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// SAP DATA TABLE COMPONENT
// Enterprise-grade table with expandable groups, sorting, row selection, and bulk actions
// ═══════════════════════════════════════════════════════════════════════════════

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render?: (value: any, row: any) => ReactNode;
}

export interface TableGroup {
  key: string;
  label: string;
  color?: string;
  count: number;
  totalAmount?: number;
  rows: any[];
}

export interface TableAction {
  key: string;
  label: string;
  icon?: typeof Trash2;
  onClick: (selectedIds: string[]) => void;
  variant?: 'default' | 'danger' | 'success';
}

export interface SAPDataTableProps {
  columns: TableColumn[];
  groups: TableGroup[];
  rowIdKey?: string;  // Key to use for row ID (default: 'id')
  selectable?: boolean;
  actions?: TableAction[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  formatCurrency?: (value: number) => string;
}

export function SAPDataTable({
  columns,
  groups,
  rowIdKey = 'id',
  selectable = false,
  actions = [],
  onSort,
  formatCurrency = (v) => `$${v.toLocaleString()}`,
}: SAPDataTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Toggle group expand/collapse
  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Handle column sort
  const handleSort = (column: string) => {
    const newDir = sortCol === column && sortDir === 'asc' ? 'desc' : 'asc';
    setSortCol(column);
    setSortDir(newDir);
    onSort?.(column, newDir);
  };

  // Row selection
  const toggleRow = (rowId: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size > 0) {
      setSelectedRows(new Set());
    } else {
      const allIds = groups.flatMap(g => g.rows.map(r => r[rowIdKey]));
      setSelectedRows(new Set(allIds));
    }
  };

  const allSelected = selectedRows.size > 0 && selectedRows.size === groups.flatMap(g => g.rows).length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Bulk Actions Toolbar */}
      {selectable && selectedRows.size > 0 && actions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              <Check size={16} className="inline mr-2" />
              {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              {actions.map(action => {
                const Icon = action.icon || FileDown;
                const variantClass = getActionVariantClass(action.variant);
                return (
                  <button
                    key={action.key}
                    onClick={() => {
                      action.onClick(Array.from(selectedRows));
                      setSelectedRows(new Set());
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${variantClass}`}
                  >
                    <Icon size={14} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800">
              {/* Selection Column */}
              {selectable && (
                <th className="px-3 py-2.5 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    {allSelected ? (
                      <CheckSquare size={16} className="text-blue-600 dark:text-blue-400" />
                    ) : someSelected ? (
                      <Square size={16} className="text-blue-600 dark:text-blue-400 fill-current" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
              )}

              {/* Expand Column */}
              <th className="px-3 py-2.5 w-8"></th>

              {/* Data Columns */}
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ width: col.width }}
                  className={`
                    px-3 py-2.5 text-${col.align || 'left'}
                    font-bold text-slate-600 dark:text-slate-300
                    ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none' : ''}
                  `}
                >
                  <span className="flex items-center gap-1 justify-${col.align || 'start'}">
                    {col.label}
                    {col.sortable && (
                      sortCol === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ArrowUpDown size={10} className="opacity-30" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <TableGroupRow
                key={group.key}
                group={group}
                columns={columns}
                expanded={expandedGroups.has(group.key)}
                onToggle={() => toggleGroup(group.key)}
                selectable={selectable}
                selectedRows={selectedRows}
                toggleRow={toggleRow}
                rowIdKey={rowIdKey}
                formatCurrency={formatCurrency}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Table Group Row Component ─────────────────────────────────────────────────

interface TableGroupRowProps {
  group: TableGroup;
  columns: TableColumn[];
  expanded: boolean;
  onToggle: () => void;
  selectable: boolean;
  selectedRows: Set<string>;
  toggleRow: (id: string) => void;
  rowIdKey: string;
  formatCurrency: (value: number) => string;
}

function TableGroupRow({
  group,
  columns,
  expanded,
  onToggle,
  selectable,
  selectedRows,
  toggleRow,
  rowIdKey,
  formatCurrency,
}: TableGroupRowProps) {
  return (
    <>
      {/* Group Header Row */}
      <tr
        onClick={onToggle}
        className="cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors"
      >
        {selectable && <td className="px-3 py-2"></td>}
        <td className="px-3 py-2">
          {expanded ? (
            <ChevronDown size={12} className="text-slate-400" />
          ) : (
            <ChevronRight size={12} className="text-slate-400" />
          )}
        </td>
        <td className="px-3 py-2" colSpan={columns.length}>
          <span className="flex items-center gap-2">
            {group.color && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: group.color }}
              />
            )}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {group.label}
            </span>
            <span className="text-[10px] text-slate-400">({group.count})</span>
            {group.totalAmount !== undefined && (
              <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 ml-2">
                {formatCurrency(group.totalAmount)}
              </span>
            )}
          </span>
        </td>
      </tr>

      {/* Detail Rows */}
      {expanded && group.rows.map((row, idx) => {
        const rowId = row[rowIdKey];
        const isSelected = selectedRows.has(rowId);

        return (
          <tr
            key={rowId || idx}
            className={`
              border-t border-slate-100 dark:border-slate-800/50
              bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/30
              transition-colors
              ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            `}
          >
            {selectable && (
              <td className="px-3 py-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRow(rowId);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare size={14} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square size={14} />
                  )}
                </button>
              </td>
            )}
            <td className="px-3 py-1.5"></td>
            {columns.map(col => {
              const value = row[col.key];
              const rendered = col.render ? col.render(value, row) : value;

              return (
                <td
                  key={col.key}
                  className={`px-3 py-1.5 text-${col.align || 'left'} text-slate-700 dark:text-slate-300`}
                >
                  {rendered}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

// ── Helper Functions ──────────────────────────────────────────────────────────

function getActionVariantClass(variant?: TableAction['variant']): string {
  switch (variant) {
    case 'danger':
      return 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300';
    case 'success':
      return 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300';
    case 'default':
    default:
      return 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300';
  }
}
