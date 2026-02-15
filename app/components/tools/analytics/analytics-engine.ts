/**
 * Autonomous Analytics Engine
 *
 * Pure TypeScript intelligence layer with zero React dependencies.
 * Receives raw parsed data (headers + rows) and produces a complete
 * analytical model: classified columns, recommended visualizations,
 * computed insights, grouping structures, and filtering.
 */

import { parseDate, parseAmount } from './analytics-store';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ColumnRole = 'dimension' | 'measure' | 'date' | 'identifier' | 'unknown';

export interface ColumnStats {
  sum: number;
  avg: number;
  min: number;
  max: number;
  median: number;
  stdDev: number;
  count: number;
}

export interface ClassifiedColumn {
  name: string;
  index: number;
  role: ColumnRole;
  dataType: 'string' | 'number' | 'date' | 'mixed';
  uniqueCount: number;
  nullCount: number;
  sampleValues: string[];
  stats?: ColumnStats;
  topValues?: { value: string; count: number }[];
}

export type ChartKind = 'bar' | 'line' | 'pie' | 'area' | 'stacked-bar' | 'horizontal-bar';

export interface VizRecommendation {
  id: string;
  title: string;
  chartKind: ChartKind;
  xField: string;
  yFields: string[];
  reasoning: string;
  priority: number;
}

export type InsightType =
  | 'top_contributor'
  | 'outlier'
  | 'dominant_category'
  | 'trend'
  | 'concentration'
  | 'comparison';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'info' | 'notable' | 'critical';
  relatedColumn?: string;
  value?: number;
}

export interface GroupNode {
  key: string;
  label: string;
  rowIndices: number[];
  aggregates: Record<string, number>;
  children?: GroupNode[];
}

export interface GroupingPlan {
  primaryDimension: string;
  secondaryDimension?: string;
  groups: GroupNode[];
}

export interface FilterState {
  dimensionFilters: Record<string, string[]>;
  dateRange?: { from: string; to: string };
  searchQuery: string;
}

export interface AnalysisResult {
  columns: ClassifiedColumn[];
  dimensions: ClassifiedColumn[];
  measures: ClassifiedColumn[];
  dateColumns: ClassifiedColumn[];
  vizRecommendations: VizRecommendation[];
  insights: Insight[];
  groupingPlan: GroupingPlan | null;
  dataQuality: {
    totalRows: number;
    totalColumns: number;
    completenessPercent: number;
    issues: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function computeColumnStats(values: number[]): ColumnStats {
  if (values.length === 0) {
    return { sum: 0, avg: 0, min: 0, max: 0, median: 0, stdDev: 0, count: 0 };
  }
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    sum,
    avg: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    median: getMedian(values),
    stdDev: getStdDev(values),
    count: values.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLUMN CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

const DATE_HEADER = /\bdate\b|\bdt\b|\btime\b|\bperiod\b|\byear\b|\bmonth\b|\bday\b|\bweek\b|\bquarter\b/i;
const ID_HEADER = /\bid\b|\bcode\b|\bserial\b|\b#\b|\bref\b|\bnumber\b|\bindex\b/i;
const MEASURE_HEADER = /\bamount\b|\bvalue\b|\bprice\b|\btotal\b|\bsum\b|\bcost\b|\bqty\b|\bquantity\b|\bcount\b|\brate\b|\bpercentage\b|\b%\b|\brevenue\b|\bprofit\b|\bsales\b|\bbudget\b|\bscore\b|\bweight\b|\bvolume\b/i;

export function classifyColumns(
  headers: string[],
  rows: string[][],
  overrides?: Record<number, ColumnRole>
): ClassifiedColumn[] {
  const sampleRows = rows.slice(0, Math.min(100, rows.length));
  const totalRows = rows.length;

  return headers.map((header, idx) => {
    const values = sampleRows.map(r => (r[idx] ?? '').toString().trim());
    const nonEmpty = values.filter(Boolean);
    const nullCount = totalRows - nonEmpty.length;

    // Count unique values across ALL rows (not just sample)
    const allValues = rows.map(r => (r[idx] ?? '').toString().trim()).filter(Boolean);
    const uniqueSet = new Set(allValues);
    const uniqueCount = uniqueSet.size;

    const sampleValues = nonEmpty.slice(0, 5);

    // Detect data types in sample
    let dateCount = 0;
    let numericCount = 0;
    const numericValues: number[] = [];

    for (const v of nonEmpty) {
      if (parseDate(v) !== null) dateCount++;
      const num = parseAmount(v);
      if (num !== 0 || v.trim() === '0' || /^[\s₹$€£,]*0([.,]0+)?[\s]*$/.test(v)) {
        numericCount++;
        numericValues.push(num);
      }
    }

    // Also parse ALL rows for stats if numeric
    const allNumericValues: number[] = [];
    if (numericCount > nonEmpty.length * 0.7) {
      for (const r of rows) {
        const v = (r[idx] ?? '').toString().trim();
        if (!v) continue;
        const num = parseAmount(v);
        if (num !== 0 || v.trim() === '0' || /^[\s₹$€£,]*0([.,]0+)?[\s]*$/.test(v)) {
          allNumericValues.push(num);
        }
      }
    }

    const h = header.toLowerCase().trim();

    // Apply override if provided
    if (overrides && overrides[idx] !== undefined) {
      const role = overrides[idx];
      const col: ClassifiedColumn = {
        name: header, index: idx, role,
        dataType: role === 'date' ? 'date' : role === 'measure' ? 'number' : 'string',
        uniqueCount, nullCount, sampleValues,
      };
      if (role === 'measure') {
        col.stats = computeColumnStats(allNumericValues.length > 0 ? allNumericValues : numericValues);
      }
      if (role === 'dimension') {
        col.topValues = getTopValues(rows, idx);
      }
      return col;
    }

    // Determine role
    let role: ColumnRole = 'unknown';
    let dataType: 'string' | 'number' | 'date' | 'mixed' = 'string';

    // Date detection
    if (nonEmpty.length > 0 && dateCount > nonEmpty.length * 0.6) {
      role = 'date';
      dataType = 'date';
    } else if (DATE_HEADER.test(h) && dateCount > nonEmpty.length * 0.3) {
      role = 'date';
      dataType = 'date';
    }
    // Numeric/Measure detection
    else if (nonEmpty.length > 0 && numericCount > nonEmpty.length * 0.7 && uniqueCount > 5) {
      role = 'measure';
      dataType = 'number';
    } else if (MEASURE_HEADER.test(h) && numericCount > nonEmpty.length * 0.5) {
      role = 'measure';
      dataType = 'number';
    }
    // Numeric but low cardinality — could be a coded dimension
    else if (nonEmpty.length > 0 && numericCount > nonEmpty.length * 0.7 && uniqueCount <= 5) {
      role = 'dimension';
      dataType = 'number';
    }
    // Identifier
    else if (ID_HEADER.test(h) || (uniqueCount > totalRows * 0.9 && uniqueCount > 10)) {
      role = 'identifier';
      dataType = 'string';
    }
    // Dimension (categorical text)
    else if (nonEmpty.length > 0 && uniqueCount <= totalRows * 0.6) {
      role = 'dimension';
      dataType = 'string';
    }
    // High cardinality text (likely description or identifier)
    else if (nonEmpty.length > 0 && uniqueCount > totalRows * 0.6) {
      role = 'identifier';
      dataType = 'string';
    }

    const col: ClassifiedColumn = {
      name: header, index: idx, role, dataType,
      uniqueCount, nullCount, sampleValues,
    };

    if (role === 'measure') {
      col.stats = computeColumnStats(allNumericValues.length > 0 ? allNumericValues : numericValues);
    }
    if (role === 'dimension') {
      col.topValues = getTopValues(rows, idx);
    }

    return col;
  });
}

function getTopValues(rows: string[][], colIndex: number, limit = 10): { value: string; count: number }[] {
  const freq: Record<string, number> = {};
  for (const r of rows) {
    const v = (r[colIndex] ?? '').toString().trim();
    if (v) freq[v] = (freq[v] || 0) + 1;
  }
  return Object.entries(freq)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUALIZATION RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function recommendVisualizations(
  columns: ClassifiedColumn[],
  rowCount: number
): VizRecommendation[] {
  const dims = columns.filter(c => c.role === 'dimension');
  const measures = columns.filter(c => c.role === 'measure');
  const dates = columns.filter(c => c.role === 'date');
  const recommendations: VizRecommendation[] = [];
  let idCounter = 0;

  // Date + measure(s) → Line chart (trend)
  if (dates.length > 0 && measures.length > 0) {
    const dateCol = dates[0];
    if (measures.length === 1) {
      recommendations.push({
        id: `viz-${idCounter++}`,
        title: `${measures[0].name} Trend over ${dateCol.name}`,
        chartKind: 'line',
        xField: dateCol.name,
        yFields: [measures[0].name],
        reasoning: 'Date + single measure → trend line',
        priority: 1,
      });
    } else {
      // Multiple measures → multi-line
      const topMeasures = measures.slice(0, 4);
      recommendations.push({
        id: `viz-${idCounter++}`,
        title: `Trends over ${dateCol.name}`,
        chartKind: 'line',
        xField: dateCol.name,
        yFields: topMeasures.map(m => m.name),
        reasoning: 'Date + multiple measures → multi-line trend',
        priority: 1,
      });
    }

    // Also add area chart for the primary measure
    recommendations.push({
      id: `viz-${idCounter++}`,
      title: `${measures[0].name} Area over ${dateCol.name}`,
      chartKind: 'area',
      xField: dateCol.name,
      yFields: [measures[0].name],
      reasoning: 'Date + measure → area chart for volume visualization',
      priority: 4,
    });
  }

  // Dimension + measure → Bar chart or Pie chart
  for (const dim of dims.slice(0, 2)) {
    for (const measure of measures.slice(0, 2)) {
      if (dim.uniqueCount <= 8) {
        recommendations.push({
          id: `viz-${idCounter++}`,
          title: `${measure.name} by ${dim.name}`,
          chartKind: 'bar',
          xField: dim.name,
          yFields: [measure.name],
          reasoning: `Low cardinality (${dim.uniqueCount}) dimension → bar chart`,
          priority: 2,
        });
        recommendations.push({
          id: `viz-${idCounter++}`,
          title: `${measure.name} Distribution by ${dim.name}`,
          chartKind: 'pie',
          xField: dim.name,
          yFields: [measure.name],
          reasoning: `Low cardinality dimension → pie chart for share visualization`,
          priority: 3,
        });
      } else {
        recommendations.push({
          id: `viz-${idCounter++}`,
          title: `Top ${dim.name} by ${measure.name}`,
          chartKind: 'horizontal-bar',
          xField: dim.name,
          yFields: [measure.name],
          reasoning: `High cardinality (${dim.uniqueCount}) → horizontal bar top entries`,
          priority: 2,
        });
      }
    }
  }

  // 2 dimensions + 1 measure → Stacked bar
  if (dims.length >= 2 && measures.length >= 1) {
    const [d1, d2] = dims;
    if (d1.uniqueCount <= 12 && d2.uniqueCount <= 8) {
      recommendations.push({
        id: `viz-${idCounter++}`,
        title: `${measures[0].name} by ${d1.name} (stacked by ${d2.name})`,
        chartKind: 'stacked-bar',
        xField: d1.name,
        yFields: [measures[0].name, d2.name],
        reasoning: '2 dimensions → stacked bar comparison',
        priority: 3,
      });
    }
  }

  // Fallback: only measures, no good dimension → compare measures side by side
  if (dims.length === 0 && dates.length === 0 && measures.length >= 2) {
    recommendations.push({
      id: `viz-${idCounter++}`,
      title: 'Measure Comparison',
      chartKind: 'bar',
      xField: '_measure_names',
      yFields: measures.map(m => m.name),
      reasoning: 'No dimensions → compare measures side-by-side',
      priority: 4,
    });
  }

  // Deduplicate and sort by priority
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUPING PLAN
// ═══════════════════════════════════════════════════════════════════════════════

export function buildGroupingPlan(
  columns: ClassifiedColumn[],
  rows: string[][]
): GroupingPlan | null {
  const dims = columns.filter(c => c.role === 'dimension');
  const measures = columns.filter(c => c.role === 'measure');

  if (dims.length === 0) return null;

  // Pick primary dimension: lowest cardinality non-date
  const primary = [...dims].sort((a, b) => a.uniqueCount - b.uniqueCount)[0];
  const secondary = dims.find(d => d.index !== primary.index);

  // Build groups
  const groupMap: Record<string, number[]> = {};
  rows.forEach((row, rowIdx) => {
    const key = (row[primary.index] ?? '').toString().trim() || '(empty)';
    if (!groupMap[key]) groupMap[key] = [];
    groupMap[key].push(rowIdx);
  });

  const groups: GroupNode[] = Object.entries(groupMap)
    .map(([key, rowIndices]) => {
      // Compute aggregates for all measures
      const aggregates: Record<string, number> = {};
      for (const m of measures) {
        let sum = 0;
        for (const ri of rowIndices) {
          sum += parseAmount(rows[ri][m.index]);
        }
        aggregates[m.name] = sum;
      }

      // Build children if secondary dimension exists
      let children: GroupNode[] | undefined;
      if (secondary) {
        const childMap: Record<string, number[]> = {};
        for (const ri of rowIndices) {
          const childKey = (rows[ri][secondary.index] ?? '').toString().trim() || '(empty)';
          if (!childMap[childKey]) childMap[childKey] = [];
          childMap[childKey].push(ri);
        }
        children = Object.entries(childMap).map(([ck, cIndices]) => {
          const cAgg: Record<string, number> = {};
          for (const m of measures) {
            let sum = 0;
            for (const ri of cIndices) sum += parseAmount(rows[ri][m.index]);
            cAgg[m.name] = sum;
          }
          return { key: ck, label: ck, rowIndices: cIndices, aggregates: cAgg };
        });
        // Sort children by first measure descending
        if (measures.length > 0) {
          children.sort((a, b) => (b.aggregates[measures[0].name] || 0) - (a.aggregates[measures[0].name] || 0));
        }
      }

      return { key, label: key, rowIndices, aggregates, children };
    })
    // Sort groups by first measure descending
    .sort((a, b) => {
      if (measures.length === 0) return b.rowIndices.length - a.rowIndices.length;
      return (b.aggregates[measures[0].name] || 0) - (a.aggregates[measures[0].name] || 0);
    });

  return {
    primaryDimension: primary.name,
    secondaryDimension: secondary?.name,
    groups,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSIGHT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

export function generateInsights(
  columns: ClassifiedColumn[],
  rows: string[][],
  groupingPlan: GroupingPlan | null
): Insight[] {
  const insights: Insight[] = [];
  const measures = columns.filter(c => c.role === 'measure');
  const dates = columns.filter(c => c.role === 'date');
  let idCounter = 0;

  if (measures.length === 0) return insights;

  const primaryMeasure = measures[0];

  // 1. Top contributor
  if (groupingPlan && groupingPlan.groups.length > 0) {
    const top = groupingPlan.groups[0];
    const total = groupingPlan.groups.reduce((a, g) => a + (g.aggregates[primaryMeasure.name] || 0), 0);
    const pct = total > 0 ? ((top.aggregates[primaryMeasure.name] || 0) / total * 100) : 0;
    insights.push({
      id: `insight-${idCounter++}`,
      type: 'top_contributor',
      title: 'Top Contributor',
      description: `"${top.key}" is the largest ${groupingPlan.primaryDimension}, accounting for ${pct.toFixed(1)}% of total ${primaryMeasure.name} (${formatNum(top.aggregates[primaryMeasure.name] || 0)}).`,
      severity: pct > 50 ? 'critical' : 'notable',
      relatedColumn: primaryMeasure.name,
      value: pct,
    });
  }

  // 2. Concentration
  if (groupingPlan && groupingPlan.groups.length >= 3) {
    const total = groupingPlan.groups.reduce((a, g) => a + (g.aggregates[primaryMeasure.name] || 0), 0);
    const top3 = groupingPlan.groups.slice(0, 3).reduce((a, g) => a + (g.aggregates[primaryMeasure.name] || 0), 0);
    const pct = total > 0 ? (top3 / total * 100) : 0;
    if (pct > 70) {
      insights.push({
        id: `insight-${idCounter++}`,
        type: 'concentration',
        title: 'High Concentration',
        description: `Top 3 ${groupingPlan.primaryDimension} values account for ${pct.toFixed(1)}% of total ${primaryMeasure.name}. Data is highly concentrated.`,
        severity: 'notable',
        relatedColumn: primaryMeasure.name,
        value: pct,
      });
    }
  }

  // 3. Dominant category
  if (groupingPlan && groupingPlan.groups.length > 1) {
    const total = groupingPlan.groups.reduce((a, g) => a + (g.aggregates[primaryMeasure.name] || 0), 0);
    for (const g of groupingPlan.groups) {
      const pct = total > 0 ? ((g.aggregates[primaryMeasure.name] || 0) / total * 100) : 0;
      if (pct > 40) {
        insights.push({
          id: `insight-${idCounter++}`,
          type: 'dominant_category',
          title: 'Dominant Category',
          description: `"${g.key}" dominates with ${pct.toFixed(1)}% share of ${primaryMeasure.name}.`,
          severity: pct > 60 ? 'critical' : 'notable',
          relatedColumn: groupingPlan.primaryDimension,
          value: pct,
        });
        break;
      }
    }
  }

  // 4. Outlier detection per measure
  for (const m of measures.slice(0, 3)) {
    if (!m.stats || m.stats.stdDev === 0) continue;
    const threshold = m.stats.avg + 2 * m.stats.stdDev;
    let outlierCount = 0;
    let maxOutlier = 0;
    for (const r of rows) {
      const v = parseAmount(r[m.index]);
      if (v > threshold) {
        outlierCount++;
        if (v > maxOutlier) maxOutlier = v;
      }
    }
    if (outlierCount > 0 && outlierCount <= rows.length * 0.05) {
      insights.push({
        id: `insight-${idCounter++}`,
        type: 'outlier',
        title: `Outliers in ${m.name}`,
        description: `${outlierCount} value${outlierCount > 1 ? 's' : ''} in ${m.name} exceed${outlierCount === 1 ? 's' : ''} 2x standard deviation. Largest: ${formatNum(maxOutlier)} (avg: ${formatNum(m.stats.avg)}).`,
        severity: 'notable',
        relatedColumn: m.name,
        value: outlierCount,
      });
    }
  }

  // 5. Trend detection (if date column exists)
  if (dates.length > 0 && rows.length >= 6) {
    const dateCol = dates[0];
    // Sort rows by date, then compare first half vs second half
    const datedRows = rows
      .map((r, i) => ({ idx: i, date: parseDate(r[dateCol.index]) || '' }))
      .filter(d => d.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (datedRows.length >= 6) {
      const mid = Math.floor(datedRows.length / 2);
      const firstHalf = datedRows.slice(0, mid);
      const secondHalf = datedRows.slice(mid);

      const firstAvg = firstHalf.reduce((a, d) => a + parseAmount(rows[d.idx][primaryMeasure.index]), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, d) => a + parseAmount(rows[d.idx][primaryMeasure.index]), 0) / secondHalf.length;

      if (firstAvg > 0) {
        const changePct = ((secondAvg - firstAvg) / firstAvg) * 100;
        if (Math.abs(changePct) > 15) {
          insights.push({
            id: `insight-${idCounter++}`,
            type: 'trend',
            title: `${primaryMeasure.name} Trend`,
            description: `${primaryMeasure.name} shows a ${changePct > 0 ? 'upward' : 'downward'} trend: second half average (${formatNum(secondAvg)}) is ${Math.abs(changePct).toFixed(1)}% ${changePct > 0 ? 'higher' : 'lower'} than first half (${formatNum(firstAvg)}).`,
            severity: Math.abs(changePct) > 30 ? 'critical' : 'notable',
            relatedColumn: primaryMeasure.name,
            value: changePct,
          });
        }
      }
    }
  }

  // 6. Measure comparison
  if (measures.length >= 2) {
    const statsArr = measures.filter(m => m.stats).map(m => ({
      name: m.name,
      sum: m.stats!.sum,
      avg: m.stats!.avg,
    }));
    const highest = statsArr.reduce((a, b) => a.sum > b.sum ? a : b);
    const lowest = statsArr.reduce((a, b) => a.sum < b.sum ? a : b);
    if (highest.name !== lowest.name) {
      insights.push({
        id: `insight-${idCounter++}`,
        type: 'comparison',
        title: 'Measure Comparison',
        description: `"${highest.name}" has the highest total (${formatNum(highest.sum)}), while "${lowest.name}" has the lowest (${formatNum(lowest.sum)}).`,
        severity: 'info',
      });
    }
  }

  return insights;
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`;
  if (Math.abs(n) >= 100_000) return `${(n / 100_000).toFixed(2)}L`;
  if (Math.abs(n) >= 1000) return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return n.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILTERING
// ═══════════════════════════════════════════════════════════════════════════════

export function applyFilters(
  rows: string[][],
  columns: ClassifiedColumn[],
  filters: FilterState
): number[] {
  const indices: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let pass = true;

    // Dimension filters
    for (const [colName, allowedValues] of Object.entries(filters.dimensionFilters)) {
      if (allowedValues.length === 0) continue;
      const col = columns.find(c => c.name === colName);
      if (!col) continue;
      const cellValue = (row[col.index] ?? '').toString().trim();
      if (!allowedValues.includes(cellValue)) { pass = false; break; }
    }
    if (!pass) continue;

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const dateCol = columns.find(c => c.role === 'date');
      if (dateCol) {
        const d = parseDate(row[dateCol.index]);
        if (d) {
          if (filters.dateRange.from && d < filters.dateRange.from) { pass = false; }
          if (filters.dateRange.to && d > filters.dateRange.to) { pass = false; }
        }
      }
    }
    if (!pass) continue;

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const rowStr = row.join(' ').toLowerCase();
      if (!rowStr.includes(q)) { pass = false; }
    }
    if (!pass) continue;

    indices.push(i);
  }

  return indices;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA QUALITY ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════════

function assessDataQuality(
  columns: ClassifiedColumn[],
  totalRows: number
): { totalRows: number; totalColumns: number; completenessPercent: number; issues: string[] } {
  const totalCells = totalRows * columns.length;
  const totalNull = columns.reduce((a, c) => a + c.nullCount, 0);
  const completenessPercent = totalCells > 0 ? ((totalCells - totalNull) / totalCells * 100) : 0;

  const issues: string[] = [];
  for (const c of columns) {
    const nullPct = totalRows > 0 ? (c.nullCount / totalRows * 100) : 0;
    if (nullPct > 30 && nullPct < 90) {
      issues.push(`Column "${c.name}" has ${nullPct.toFixed(0)}% missing values`);
    }
    if (nullPct >= 90) {
      issues.push(`Column "${c.name}" is mostly empty (${nullPct.toFixed(0)}%)`);
    }
  }

  const unknowns = columns.filter(c => c.role === 'unknown');
  if (unknowns.length > 0) {
    issues.push(`${unknowns.length} column${unknowns.length > 1 ? 's' : ''} could not be classified`);
  }

  return { totalRows, totalColumns: columns.length, completenessPercent, issues };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOP-LEVEL ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

export function analyzeData(
  headers: string[],
  rows: string[][],
  overrides?: Record<number, ColumnRole>
): AnalysisResult {
  const columns = classifyColumns(headers, rows, overrides);
  const dimensions = columns.filter(c => c.role === 'dimension');
  const measures = columns.filter(c => c.role === 'measure');
  const dateColumns = columns.filter(c => c.role === 'date');

  const vizRecommendations = recommendVisualizations(columns, rows.length);
  const groupingPlan = buildGroupingPlan(columns, rows);
  const insights = generateInsights(columns, rows, groupingPlan);
  const dataQuality = assessDataQuality(columns, rows.length);

  return {
    columns,
    dimensions,
    measures,
    dateColumns,
    vizRecommendations,
    insights,
    groupingPlan,
    dataQuality,
  };
}
