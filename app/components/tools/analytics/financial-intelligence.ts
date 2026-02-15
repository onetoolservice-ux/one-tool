/**
 * Financial Intelligence Engine
 *
 * Autonomous analysis layer for personal financial data.
 * Generates insights, detects anomalies, predicts trends, and provides recommendations.
 */

import type { Transaction, MonthlyData } from './analytics-store';
import { groupByCategory, calculateSummary } from './analytics-store';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FinancialSummary {
  currentMonthSavings: number;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  incomeConsistency: 'consistent' | 'variable' | 'volatile';
  consistencyScore: number;
}

export interface AutoInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'warning' | 'critical';
  category?: string;
  value?: number;
  change?: number;
}

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  transaction?: Transaction;
  category?: string;
  amount?: number;
}

export interface Prediction {
  id: string;
  type: 'expense' | 'income' | 'savings';
  amount: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  basis: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: number; // potential savings amount
  effort: 'low' | 'medium' | 'high';
  category?: string;
  actionable: string;
}

export interface TimeComparison {
  period: string;
  income: number;
  expenses: number;
  netFlow: number;
  change: number;
  changePercent: number;
}

export interface FinancialIntelligence {
  summary: FinancialSummary;
  insights: AutoInsight[];
  anomalies: Anomaly[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  comparisons: TimeComparison[];
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

export function generateFinancialSummary(
  currentMonth: MonthlyData | null,
  previousMonth: MonthlyData | null,
  historicalMonths: MonthlyData[]
): FinancialSummary {
  if (!currentMonth) {
    return {
      currentMonthSavings: 0,
      spendingTrend: 'stable',
      trendPercentage: 0,
      incomeConsistency: 'consistent',
      consistencyScore: 0,
    };
  }

  const currentSavings = currentMonth.summary.netFlow;

  // Spending trend
  let spendingTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let trendPercentage = 0;

  if (previousMonth && previousMonth.summary.totalDebits > 0) {
    const change = currentMonth.summary.totalDebits - previousMonth.summary.totalDebits;
    trendPercentage = (change / previousMonth.summary.totalDebits) * 100;

    if (trendPercentage > 5) spendingTrend = 'increasing';
    else if (trendPercentage < -5) spendingTrend = 'decreasing';
    else spendingTrend = 'stable';
  }

  // Income consistency
  let incomeConsistency: 'consistent' | 'variable' | 'volatile' = 'consistent';
  let consistencyScore = 100;

  if (historicalMonths.length >= 3) {
    const incomes = historicalMonths.map(m => m.summary.totalCredits).filter(i => i > 0);
    if (incomes.length >= 3) {
      const avg = incomes.reduce((a, b) => a + b, 0) / incomes.length;
      const variance = incomes.reduce((a, i) => a + Math.pow(i - avg, 2), 0) / incomes.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = avg > 0 ? (stdDev / avg) * 100 : 0;

      consistencyScore = Math.max(0, 100 - coefficientOfVariation);

      if (coefficientOfVariation < 10) incomeConsistency = 'consistent';
      else if (coefficientOfVariation < 25) incomeConsistency = 'variable';
      else incomeConsistency = 'volatile';
    }
  }

  return {
    currentMonthSavings: currentSavings,
    spendingTrend,
    trendPercentage,
    incomeConsistency,
    consistencyScore,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATIC INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════

export function generateAutoInsights(
  currentMonth: MonthlyData | null,
  previousMonth: MonthlyData | null,
  historicalMonths: MonthlyData[]
): AutoInsight[] {
  const insights: AutoInsight[] = [];
  if (!currentMonth) return insights;

  let idCounter = 0;

  // Highest spending category
  const expenseCategories = groupByCategory(currentMonth.transactions.filter(t => t.type === 'debit'));
  if (expenseCategories.length > 0) {
    const top = expenseCategories[0];
    const totalExpenses = currentMonth.summary.totalDebits;
    const percentage = totalExpenses > 0 ? (top.totalAmount / totalExpenses) * 100 : 0;

    insights.push({
      id: `insight-${idCounter++}`,
      title: 'Top Spending Category',
      description: `${top.key} accounts for ${percentage.toFixed(1)}% of your total expenses (₹${top.totalAmount.toLocaleString()})`,
      type: percentage > 40 ? 'warning' : 'neutral',
      category: top.key,
      value: top.totalAmount,
    });
  }

  // Dominant income source
  const incomeCategories = groupByCategory(currentMonth.transactions.filter(t => t.type === 'credit'));
  if (incomeCategories.length > 0) {
    const topIncome = incomeCategories[0];
    const totalIncome = currentMonth.summary.totalCredits;
    const percentage = totalIncome > 0 ? (topIncome.totalAmount / totalIncome) * 100 : 0;

    insights.push({
      id: `insight-${idCounter++}`,
      title: 'Primary Income Source',
      description: `${topIncome.key} contributes ${percentage.toFixed(1)}% of your total income (₹${topIncome.totalAmount.toLocaleString()})`,
      type: 'positive',
      category: topIncome.key,
      value: topIncome.totalAmount,
    });
  }

  // Month-over-month comparison
  if (previousMonth) {
    const expenseChange = currentMonth.summary.totalDebits - previousMonth.summary.totalDebits;
    const expenseChangePercent = previousMonth.summary.totalDebits > 0
      ? (expenseChange / previousMonth.summary.totalDebits) * 100
      : 0;

    if (Math.abs(expenseChangePercent) > 10) {
      insights.push({
        id: `insight-${idCounter++}`,
        title: expenseChange > 0 ? 'Expenses Increased' : 'Expenses Decreased',
        description: `Your spending ${expenseChange > 0 ? 'increased' : 'decreased'} by ₹${Math.abs(expenseChange).toLocaleString()} (${Math.abs(expenseChangePercent).toFixed(1)}%) compared to last month`,
        type: expenseChange > 0 ? 'warning' : 'positive',
        value: Math.abs(expenseChange),
        change: expenseChangePercent,
      });
    }

    // Category-level changes
    const prevExpenseGroups = groupByCategory(previousMonth.transactions.filter(t => t.type === 'debit'));
    const prevMap = new Map(prevExpenseGroups.map(g => [g.key, g.totalAmount]));

    for (const currentGroup of expenseCategories.slice(0, 3)) {
      const prevAmount = prevMap.get(currentGroup.key) || 0;
      if (prevAmount > 0) {
        const change = currentGroup.totalAmount - prevAmount;
        const changePercent = (change / prevAmount) * 100;

        if (Math.abs(changePercent) > 30) {
          insights.push({
            id: `insight-${idCounter++}`,
            title: `${currentGroup.key}: ${change > 0 ? 'Spike' : 'Drop'}`,
            description: `${currentGroup.key} spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(0)}% (₹${Math.abs(change).toLocaleString()})`,
            type: change > 0 ? 'warning' : 'positive',
            category: currentGroup.key,
            value: Math.abs(change),
            change: changePercent,
          });
        }
      }
    }
  }

  // Spending concentration risk
  if (expenseCategories.length >= 3) {
    const totalExpenses = currentMonth.summary.totalDebits;
    const top3Total = expenseCategories.slice(0, 3).reduce((sum, g) => sum + g.totalAmount, 0);
    const concentration = totalExpenses > 0 ? (top3Total / totalExpenses) * 100 : 0;

    if (concentration > 70) {
      insights.push({
        id: `insight-${idCounter++}`,
        title: 'High Spending Concentration',
        description: `${concentration.toFixed(0)}% of your expenses are concentrated in just 3 categories. Consider diversifying your spending pattern`,
        type: 'warning',
        value: concentration,
      });
    }
  }

  // Savings rate
  const savingsRate = currentMonth.summary.totalCredits > 0
    ? (currentMonth.summary.netFlow / currentMonth.summary.totalCredits) * 100
    : 0;

  if (savingsRate >= 20) {
    insights.push({
      id: `insight-${idCounter++}`,
      title: 'Strong Savings Rate',
      description: `You're saving ${savingsRate.toFixed(1)}% of your income this month. Excellent financial discipline!`,
      type: 'positive',
      value: savingsRate,
    });
  } else if (savingsRate < 0) {
    insights.push({
      id: `insight-${idCounter++}`,
      title: 'Deficit Alert',
      description: `Your expenses exceed income by ₹${Math.abs(currentMonth.summary.netFlow).toLocaleString()}. Consider reducing discretionary spending`,
      type: 'critical',
      value: Math.abs(currentMonth.summary.netFlow),
    });
  } else if (savingsRate < 10) {
    insights.push({
      id: `insight-${idCounter++}`,
      title: 'Low Savings Rate',
      description: `You're only saving ${savingsRate.toFixed(1)}% of your income. Aim for at least 20% for healthy finances`,
      type: 'warning',
      value: savingsRate,
    });
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

export function detectAnomalies(
  currentMonth: MonthlyData | null,
  previousMonth: MonthlyData | null,
  historicalMonths: MonthlyData[]
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  if (!currentMonth) return anomalies;

  let idCounter = 0;
  const allExpenses = currentMonth.transactions.filter(t => t.type === 'debit');

  // Calculate historical statistics
  const historicalExpenses = historicalMonths.flatMap(m =>
    m.transactions.filter(t => t.type === 'debit')
  );

  if (historicalExpenses.length > 0) {
    const amounts = historicalExpenses.map(t => t.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, amt) => a + Math.pow(amt - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const threshold = avg + (2 * stdDev);

    // Detect unusually high transactions
    const highTransactions = allExpenses.filter(t => t.amount > threshold);
    for (const txn of highTransactions.slice(0, 3)) {
      anomalies.push({
        id: `anomaly-${idCounter++}`,
        title: 'Unusually High Transaction',
        description: `${txn.description} (₹${txn.amount.toLocaleString()}) is significantly higher than your typical ${txn.category} spending`,
        severity: txn.amount > threshold * 1.5 ? 'high' : 'medium',
        transaction: txn,
        category: txn.category,
        amount: txn.amount,
      });
    }
  }

  // Detect new expense categories
  if (previousMonth && historicalMonths.length >= 2) {
    const historicalCategories = new Set(
      historicalMonths.flatMap(m => m.transactions.filter(t => t.type === 'debit').map(t => t.category))
    );

    const currentCategories = new Set(allExpenses.map(t => t.category));
    const newCategories = Array.from(currentCategories).filter(c => !historicalCategories.has(c));

    for (const cat of newCategories) {
      const catExpenses = allExpenses.filter(t => t.category === cat);
      const total = catExpenses.reduce((sum, t) => sum + t.amount, 0);

      anomalies.push({
        id: `anomaly-${idCounter++}`,
        title: 'New Expense Category',
        description: `${cat} is a new category this month with ₹${total.toLocaleString()} in expenses`,
        severity: total > currentMonth.summary.totalDebits * 0.1 ? 'medium' : 'low',
        category: cat,
        amount: total,
      });
    }
  }

  // Detect category spikes
  if (previousMonth) {
    const currentGroups = groupByCategory(allExpenses);
    const prevGroups = groupByCategory(previousMonth.transactions.filter(t => t.type === 'debit'));
    const prevMap = new Map(prevGroups.map(g => [g.key, g.totalAmount]));

    for (const group of currentGroups) {
      const prevAmount = prevMap.get(group.key);
      if (prevAmount && prevAmount > 0) {
        const change = group.totalAmount - prevAmount;
        const changePercent = (change / prevAmount) * 100;

        if (changePercent > 100) {
          anomalies.push({
            id: `anomaly-${idCounter++}`,
            title: `Spike in ${group.key}`,
            description: `${group.key} spending more than doubled: ₹${prevAmount.toLocaleString()} → ₹${group.totalAmount.toLocaleString()} (+${changePercent.toFixed(0)}%)`,
            severity: changePercent > 200 ? 'high' : 'medium',
            category: group.key,
            amount: change,
          });
        }
      }
    }
  }

  // Detect recurring expenses with unusual amounts
  const recurringPatterns = detectRecurringExpenses(allExpenses, historicalMonths);
  for (const pattern of recurringPatterns) {
    if (pattern.variance > 50) {
      anomalies.push({
        id: `anomaly-${idCounter++}`,
        title: `${pattern.category}: Unusual Amount`,
        description: `This recurring expense varies significantly. Current: ₹${pattern.currentAmount.toLocaleString()}, Average: ₹${pattern.avgAmount.toLocaleString()}`,
        severity: 'low',
        category: pattern.category,
        amount: Math.abs(pattern.currentAmount - pattern.avgAmount),
      });
    }
  }

  return anomalies.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

interface RecurringPattern {
  category: string;
  description: string;
  currentAmount: number;
  avgAmount: number;
  variance: number;
}

function detectRecurringExpenses(
  currentExpenses: Transaction[],
  historicalMonths: MonthlyData[]
): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];

  // Group by description (simplified recurring detection)
  const descMap = new Map<string, Transaction[]>();
  for (const txn of currentExpenses) {
    const key = txn.description.toLowerCase().trim();
    if (!descMap.has(key)) descMap.set(key, []);
    descMap.get(key)!.push(txn);
  }

  // Check historical presence
  const historicalExpenses = historicalMonths.flatMap(m =>
    m.transactions.filter(t => t.type === 'debit')
  );

  for (const [desc, txns] of descMap) {
    const historical = historicalExpenses.filter(t =>
      t.description.toLowerCase().trim() === desc
    );

    if (historical.length >= 2) {
      const amounts = historical.map(t => t.amount);
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const current = txns[0].amount;
      const variance = Math.abs(((current - avg) / avg) * 100);

      if (variance > 30) {
        patterns.push({
          category: txns[0].category,
          description: txns[0].description,
          currentAmount: current,
          avgAmount: avg,
          variance,
        });
      }
    }
  }

  return patterns;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTIVE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

export function generatePredictions(
  currentMonth: MonthlyData | null,
  historicalMonths: MonthlyData[]
): Prediction[] {
  const predictions: Prediction[] = [];
  let idCounter = 0;

  if (historicalMonths.length < 2) {
    return [{
      id: `pred-${idCounter++}`,
      type: 'expense',
      amount: 0,
      confidence: 'low',
      explanation: 'Not enough historical data for predictions',
      basis: 'Need at least 2 months of data',
    }];
  }

  // Predict next month expenses
  const expenseAmounts = historicalMonths.map(m => m.summary.totalDebits);
  const avgExpenses = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;

  // Calculate trend
  const recentExpenses = expenseAmounts.slice(-3);
  const trend = recentExpenses.length >= 2
    ? recentExpenses[recentExpenses.length - 1] - recentExpenses[0]
    : 0;

  const predictedExpenses = avgExpenses + (trend * 0.3); // Apply 30% of trend

  predictions.push({
    id: `pred-${idCounter++}`,
    type: 'expense',
    amount: predictedExpenses,
    confidence: historicalMonths.length >= 4 ? 'high' : 'medium',
    explanation: `Based on ${historicalMonths.length} months of data, your expenses are ${trend > 0 ? 'trending upward' : trend < 0 ? 'trending downward' : 'stable'}`,
    basis: `Historical average: ₹${avgExpenses.toLocaleString()}, Trend adjustment: ₹${trend.toLocaleString()}`,
  });

  // Predict income
  const incomeAmounts = historicalMonths.map(m => m.summary.totalCredits).filter(i => i > 0);
  if (incomeAmounts.length >= 2) {
    const avgIncome = incomeAmounts.reduce((a, b) => a + b, 0) / incomeAmounts.length;
    const variance = incomeAmounts.reduce((a, i) => a + Math.pow(i - avgIncome, 2), 0) / incomeAmounts.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = avgIncome > 0 ? (stdDev / avgIncome) * 100 : 100;

    predictions.push({
      id: `pred-${idCounter++}`,
      type: 'income',
      amount: avgIncome,
      confidence: consistencyScore < 10 ? 'high' : consistencyScore < 25 ? 'medium' : 'low',
      explanation: `Your income is ${consistencyScore < 10 ? 'very consistent' : consistencyScore < 25 ? 'moderately consistent' : 'variable'}`,
      basis: `Average: ₹${avgIncome.toLocaleString()}, Variation: ${consistencyScore.toFixed(1)}%`,
    });
  }

  // Predict savings
  const predictedIncome = incomeAmounts.length > 0
    ? incomeAmounts.reduce((a, b) => a + b, 0) / incomeAmounts.length
    : 0;
  const predictedSavings = predictedIncome - predictedExpenses;

  predictions.push({
    id: `pred-${idCounter++}`,
    type: 'savings',
    amount: predictedSavings,
    confidence: historicalMonths.length >= 4 ? 'medium' : 'low',
    explanation: predictedSavings > 0
      ? `If current patterns continue, you'll save ₹${predictedSavings.toLocaleString()} next month`
      : `Based on trends, you may face a deficit of ₹${Math.abs(predictedSavings).toLocaleString()} next month`,
    basis: `Projected income: ₹${predictedIncome.toLocaleString()}, Projected expenses: ₹${predictedExpenses.toLocaleString()}`,
  });

  return predictions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function generateRecommendations(
  currentMonth: MonthlyData | null,
  historicalMonths: MonthlyData[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  if (!currentMonth) return recommendations;

  let idCounter = 0;
  const expenseCategories = groupByCategory(currentMonth.transactions.filter(t => t.type === 'debit'));

  // High-impact category reduction
  if (expenseCategories.length > 0) {
    const top = expenseCategories[0];
    const reduction10 = top.totalAmount * 0.1;
    const reduction20 = top.totalAmount * 0.2;

    recommendations.push({
      id: `rec-${idCounter++}`,
      title: `Reduce ${top.key} Spending`,
      description: `${top.key} is your highest expense category`,
      impact: reduction10,
      effort: 'medium',
      category: top.key,
      actionable: `Reducing ${top.key} by just 10% would save ₹${reduction10.toLocaleString()} per month (₹${(reduction10 * 12).toLocaleString()} annually)`,
    });

    if (top.totalAmount > currentMonth.summary.totalDebits * 0.3) {
      recommendations.push({
        id: `rec-${idCounter++}`,
        title: `${top.key}: High Impact Opportunity`,
        description: `Since ${top.key} dominates your spending, a 20% reduction here has massive impact`,
        impact: reduction20,
        effort: 'high',
        category: top.key,
        actionable: `Saving 20% in ${top.key} would free up ₹${reduction20.toLocaleString()}/month (₹${(reduction20 * 12).toLocaleString()}/year)`,
      });
    }
  }

  // Recurring expense optimization
  const recurringExpenses = detectRecurringExpenses(
    currentMonth.transactions.filter(t => t.type === 'debit'),
    historicalMonths
  );

  const highRecurring = currentMonth.transactions
    .filter(t => t.type === 'debit' && (
      t.category === 'Subscription' ||
      t.category === 'Insurance' ||
      t.description.toLowerCase().includes('subscription') ||
      t.description.toLowerCase().includes('premium')
    ))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  for (const txn of highRecurring) {
    recommendations.push({
      id: `rec-${idCounter++}`,
      title: `Review Recurring: ${txn.category}`,
      description: `${txn.description} - ₹${txn.amount.toLocaleString()}/month`,
      impact: txn.amount,
      effort: 'low',
      category: txn.category,
      actionable: `Canceling or downgrading this recurring expense could save ₹${(txn.amount * 12).toLocaleString()} annually`,
    });
  }

  // Category-specific recommendations
  if (expenseCategories.length >= 3) {
    for (const cat of expenseCategories.slice(0, 3)) {
      const targetReduction = cat.totalAmount * 0.15;

      if (cat.key === 'Dining' || cat.key === 'Entertainment') {
        recommendations.push({
          id: `rec-${idCounter++}`,
          title: `Optimize ${cat.key}`,
          description: `Discretionary spending category with high savings potential`,
          impact: targetReduction,
          effort: 'low',
          category: cat.key,
          actionable: `Setting a weekly budget for ${cat.key} could reduce spending by ₹${targetReduction.toLocaleString()}/month`,
        });
      }

      if (cat.key === 'Shopping' && cat.totalAmount > 5000) {
        recommendations.push({
          id: `rec-${idCounter++}`,
          title: 'Shopping: Impulse Control',
          description: 'High shopping expenses indicate potential impulse purchases',
          impact: targetReduction,
          effort: 'medium',
          category: cat.key,
          actionable: `Implement a 24-hour rule before purchases to save ₹${targetReduction.toLocaleString()}/month`,
        });
      }
    }
  }

  // Savings rate improvement
  const savingsRate = currentMonth.summary.totalCredits > 0
    ? (currentMonth.summary.netFlow / currentMonth.summary.totalCredits) * 100
    : 0;

  if (savingsRate < 20 && currentMonth.summary.totalCredits > 0) {
    const targetSavings = currentMonth.summary.totalCredits * 0.2;
    const gap = targetSavings - currentMonth.summary.netFlow;

    if (gap > 0) {
      recommendations.push({
        id: `rec-${idCounter++}`,
        title: 'Reach 20% Savings Rate',
        description: 'Financial experts recommend saving at least 20% of income',
        impact: gap,
        effort: 'high',
        actionable: `You need to reduce expenses by ₹${gap.toLocaleString()}/month to reach a healthy 20% savings rate`,
      });
    }
  }

  return recommendations.sort((a, b) => b.impact - a.impact).slice(0, 6);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIME COMPARISONS
// ═══════════════════════════════════════════════════════════════════════════════

export function generateTimeComparisons(
  currentMonth: MonthlyData | null,
  previousMonth: MonthlyData | null,
  historicalMonths: MonthlyData[]
): TimeComparison[] {
  const comparisons: TimeComparison[] = [];
  if (!currentMonth) return comparisons;

  const current = currentMonth.summary;

  // vs Previous Month
  if (previousMonth) {
    const prev = previousMonth.summary;
    const change = current.netFlow - prev.netFlow;
    const changePercent = prev.netFlow !== 0 ? (change / Math.abs(prev.netFlow)) * 100 : 0;

    comparisons.push({
      period: 'Previous Month',
      income: prev.totalCredits,
      expenses: prev.totalDebits,
      netFlow: prev.netFlow,
      change,
      changePercent,
    });
  }

  // vs Historical Average
  if (historicalMonths.length >= 2) {
    const avgIncome = historicalMonths.reduce((sum, m) => sum + m.summary.totalCredits, 0) / historicalMonths.length;
    const avgExpenses = historicalMonths.reduce((sum, m) => sum + m.summary.totalDebits, 0) / historicalMonths.length;
    const avgNet = avgIncome - avgExpenses;
    const change = current.netFlow - avgNet;
    const changePercent = avgNet !== 0 ? (change / Math.abs(avgNet)) * 100 : 0;

    comparisons.push({
      period: `${historicalMonths.length}-Month Average`,
      income: avgIncome,
      expenses: avgExpenses,
      netFlow: avgNet,
      change,
      changePercent,
    });
  }

  return comparisons;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

export function generateFinancialIntelligence(
  monthsData: MonthlyData[]
): FinancialIntelligence {
  if (monthsData.length === 0) {
    return {
      summary: {
        currentMonthSavings: 0,
        spendingTrend: 'stable',
        trendPercentage: 0,
        incomeConsistency: 'consistent',
        consistencyScore: 0,
      },
      insights: [],
      anomalies: [],
      predictions: [],
      recommendations: [],
      comparisons: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  const currentMonth = monthsData[0];
  const previousMonth = monthsData.length > 1 ? monthsData[1] : null;
  const historicalMonths = monthsData.slice(1);

  return {
    summary: generateFinancialSummary(currentMonth, previousMonth, historicalMonths),
    insights: generateAutoInsights(currentMonth, previousMonth, historicalMonths),
    anomalies: detectAnomalies(currentMonth, previousMonth, historicalMonths),
    predictions: generatePredictions(currentMonth, historicalMonths),
    recommendations: generateRecommendations(currentMonth, historicalMonths),
    comparisons: generateTimeComparisons(currentMonth, previousMonth, historicalMonths),
    lastUpdated: new Date().toISOString(),
  };
}
