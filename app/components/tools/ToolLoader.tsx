"use client";
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from '@/app/components/shared/ErrorBoundary';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';
import { trackToolOpened, trackEvent } from '@/app/lib/telemetry';
import { recordVisit } from '@/app/lib/home-store';

// Tool component mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolComponentLoader = () => Promise<{ default: ComponentType<any> }>;
const toolComponents: Record<string, ToolComponentLoader> = {
  'smart-budget': () => import('@/app/components/tools/finance/BudgetPlanner').then(mod => ({ default: mod.BudgetPlanner })),
  'smart-loan': () => import('@/app/components/tools/finance/SmartLoanEnhanced').then(mod => ({ default: mod.SmartLoanEnhanced })),
  'smart-sip': () => import('@/app/components/tools/finance/SipCalculator').then(mod => ({ default: mod.SipCalculator })),
  'gst-calculator': () => import('@/app/components/tools/finance/GstCalculator').then(mod => ({ default: mod.GstCalculator })),
  'smart-net-worth': () => import('@/app/components/tools/finance/NetWorth').then(mod => ({ default: mod.NetWorthTracker })),
  'smart-retirement': () => import('@/app/components/tools/finance/RetirementPlanner').then(mod => ({ default: mod.RetirementPlanner })),
  // Personal Finance
  'pf-bank-connect': () => import('@/app/components/tools/personal-finance/PfBankConnect').then(mod => ({ default: mod.PfBankConnect })),
  'pf-statement-manager': () => import('@/app/components/tools/personal-finance/PfStatementManager').then(mod => ({ default: mod.StatementManager })),
  'pf-financial-position': () => import('@/app/components/tools/personal-finance/PfFinancialPosition').then(mod => ({ default: mod.FinancialPosition })),
  'pf-cash-flow': () => import('@/app/components/tools/personal-finance/PfCashFlow').then(mod => ({ default: mod.Income })),
  'pf-tx-explorer': () => import('@/app/components/tools/personal-finance/PfTransactionExplorer').then(mod => ({ default: mod.TransactionExplorer })),
  'pf-expenditure': () => import('@/app/components/tools/personal-finance/PfExpenditure').then(mod => ({ default: mod.ExpenditureDistribution })),
  'pf-expenses': () => import('@/app/components/tools/personal-finance/PfExpenses').then(mod => ({ default: mod.Expenses })),
  'pf-commitments': () => import('@/app/components/tools/personal-finance/PfCommitments').then(mod => ({ default: mod.CommitmentsRegister })),
  'pf-recurring': () => import('@/app/components/tools/personal-finance/PfRecurringPayments').then(mod => ({ default: mod.RecurringPayments })),
  'pf-top-merchants': () => import('@/app/components/tools/personal-finance/PfTopMerchants').then(mod => ({ default: mod.TopMerchants })),
  'pf-big-spends': () => import('@/app/components/tools/personal-finance/PfBigSpends').then(mod => ({ default: mod.BigSpends })),
  'pf-rules': () => import('@/app/components/tools/personal-finance/PfRules').then(mod => ({ default: mod.CategoryRules })),
  'pf-income-sources': () => import('@/app/components/tools/personal-finance/PfIncomeSources').then(mod => ({ default: mod.IncomeSources })),
  'pf-behavior': () => import('@/app/components/tools/personal-finance/PfBehavior').then(mod => ({ default: mod.SpendingBehavior })),
  'pf-savings-trend': () => import('@/app/components/tools/personal-finance/PfSavingsTrend').then(mod => ({ default: mod.SavingsTrend })),
  'pf-month-compare': () => import('@/app/components/tools/personal-finance/PfMonthCompare').then(mod => ({ default: mod.MonthComparison })),
  'pf-heatmap': () => import('@/app/components/tools/personal-finance/PfHeatmap').then(mod => ({ default: mod.SpendingHeatmap })),
  'pf-subscriptions': () => import('@/app/components/tools/personal-finance/PfSubscriptions').then(mod => ({ default: mod.SubscriptionFinder })),
  'pf-labels': () => import('@/app/components/tools/personal-finance/PfLabels').then(mod => ({ default: mod.LabelManager })),
  'pf-liability': () => import('@/app/components/tools/personal-finance/PfLiability').then(mod => ({ default: mod.LiabilityLedger })),
  'pf-ai-analyst': () => import('@/app/components/tools/personal-finance/PfAiAnalyst').then(mod => ({ default: mod.PFAIAnalyst })),
  'pf-health-score': () => import('@/app/components/tools/personal-finance/PfHealthScore').then(mod => ({ default: mod.FinancialHealthScore })),
  'pf-spending-dna': () => import('@/app/components/tools/personal-finance/PfSpendingDna').then(mod => ({ default: mod.SpendingDNA })),
  'pf-investment-tracker': () => import('@/app/components/tools/personal-finance/PfInvestmentTracker').then(mod => ({ default: mod.PFInvestmentTracker })),
  'pf-budget-vs-actual': () => import('@/app/components/tools/personal-finance/PfBudgetVsActual').then(mod => ({ default: mod.BudgetVsActual })),
  'pf-budget-planner': () => import('@/app/components/tools/personal-finance/PfBudgetPlanner').then(mod => ({ default: mod.MonthlyBudgetPlanner })),
  'pf-financial-snapshot': () => import('@/app/components/tools/personal-finance/PfFinancialSnapshot').then(mod => ({ default: mod.PFFinancialSnapshot })),
  'pf-daily-pulse': () => import('@/app/components/tools/personal-finance/PfDailyPulse').then(mod => ({ default: mod.DailyTransactionPulse })),
  // Finance — new tools
  'fire-calc': () => import('@/app/components/tools/finance/FireCalculator').then(mod => ({ default: mod.FireCalculator })),
  'cost-of-delay': () => import('@/app/components/tools/finance/CostOfDelay').then(mod => ({ default: mod.CostOfDelay })),
  'debt-planner': () => import('@/app/components/tools/finance/DebtPlanner').then(mod => ({ default: mod.DebtPlanner })),
  'portfolio-rebalance': () => import('@/app/components/tools/finance/PortfolioRebalance').then(mod => ({ default: mod.PortfolioRebalance })),
  'ctc-calc': () => import('@/app/components/tools/finance/CtcCalculator').then(mod => ({ default: mod.CTCCalculator })),
  'hra-calc': () => import('@/app/components/tools/finance/HraCalculator').then(mod => ({ default: mod.HRACalculator })),
  'gratuity-calc': () => import('@/app/components/tools/finance/GratuityCalculator').then(mod => ({ default: mod.GratuityCalculator })),
  'capital-gains-calc': () => import('@/app/components/tools/finance/CapitalGainsCalc').then(mod => ({ default: mod.CapitalGainsCalc })),
  'tax-saving-compare': () => import('@/app/components/tools/finance/TaxSavingCompare').then(mod => ({ default: mod.TaxSavingCompare })),
  'sub-audit': () => import('@/app/components/tools/finance/SubAudit').then(mod => ({ default: mod.SubscriptionAudit })),
  'wedding-budget': () => import('@/app/components/tools/finance/WeddingBudget').then(mod => ({ default: mod.WeddingBudget })),
  'salary-nego': () => import('@/app/components/tools/finance/SalaryNego').then(mod => ({ default: mod.SalaryNego })),
  'fd-calculator': () => import('@/app/components/tools/finance/FdCalculator').then(mod => ({ default: mod.FDCalculator })),
  'nps-calculator': () => import('@/app/components/tools/finance/NpsCalculator').then(mod => ({ default: mod.NPSCalculator })),
  'ppf-calculator': () => import('@/app/components/tools/finance/PpfCalculator').then(mod => ({ default: mod.PPFCalculator })),
  // GST & Tax
  'tds-finder': () => import('@/app/components/tools/gst-tax/TdsFinder').then(mod => ({ default: mod.TdsFinder })),
  'deduction-tracker': () => import('@/app/components/tools/gst-tax/DeductionTracker').then(mod => ({ default: mod.DeductionTracker })),
  'tax-calendar': () => import('@/app/components/tools/gst-tax/TaxCalendar').then(mod => ({ default: mod.TaxCalendar })),
  'advance-tax-calc': () => import('@/app/components/tools/gst-tax/AdvanceTaxCalc').then(mod => ({ default: mod.AdvanceTaxCalc })),
  'income-tax-calc': () => import('@/app/components/tools/gst-tax/IncomeTaxCalc').then(mod => ({ default: mod.IncomeTaxCalc })),
  'itr-checklist': () => import('@/app/components/tools/gst-tax/ItrChecklist').then(mod => ({ default: mod.ITRChecklist })),
  // Business OS
  'biz-dashboard': () => import('@/app/components/tools/business-os/BizDashboard').then(mod => ({ default: mod.BizDashboard })),
  'biz-daybook': () => import('@/app/components/tools/business-os/BizDaybook').then(mod => ({ default: mod.BizDaybook })),
  'biz-parties': () => import('@/app/components/tools/business-os/BizParties').then(mod => ({ default: mod.BizParties })),
  'biz-inventory': () => import('@/app/components/tools/business-os/BizInventory').then(mod => ({ default: mod.BizInventory })),
  'biz-invoices': () => import('@/app/components/tools/business-os/BizInvoices').then(mod => ({ default: mod.BizInvoices })),
  'biz-reports': () => import('@/app/components/tools/business-os/BizReports').then(mod => ({ default: mod.BizReports })),
  'biz-products': () => import('@/app/components/tools/business-os/BizProducts').then(mod => ({ default: mod.BizProducts })),
  'biz-stock-entry': () => import('@/app/components/tools/business-os/BizStockEntry').then(mod => ({ default: mod.BizStockEntry })),
  'biz-outstanding': () => import('@/app/components/tools/business-os/BizOutstanding').then(mod => ({ default: mod.BizOutstanding })),
  'biz-purchases': () => import('@/app/components/tools/business-os/BizPurchases').then(mod => ({ default: mod.BizPurchases })),
  'biz-quotations': () => import('@/app/components/tools/business-os/BizQuotations').then(mod => ({ default: mod.BizQuotations })),
  'biz-staff': () => import('@/app/components/tools/business-os/BizStaff').then(mod => ({ default: mod.BizStaff })),
  'biz-gst': () => import('@/app/components/tools/business-os/BizGst').then(mod => ({ default: mod.BizGST })),
  'biz-cashflow': () => import('@/app/components/tools/business-os/BizCashflow').then(mod => ({ default: mod.BizCashflow })),
  'biz-loans': () => import('@/app/components/tools/business-os/BizLoans').then(mod => ({ default: mod.BizLoans })),
  'biz-reconcile': () => import('@/app/components/tools/business-os/BizReconcile').then(mod => ({ default: mod.BizReconcile })),
};

interface ToolLoaderProps {
  toolId: string;
  [key: string]: unknown;
}

export function ToolLoader({ toolId, ...props }: ToolLoaderProps) {
  const loader = toolComponents[toolId];

  // Track tool open & record for "Recently Used" (fires once per mount)
  const hasLoader = !!loader;
  useEffect(() => {
    if (hasLoader) {
      trackToolOpened(toolId);
      recordVisit(toolId); // single source of truth — writes to onetool-my-home store
    } else {
      trackEvent('tool_not_found', { tool_id: toolId });
    }
  }, [toolId, hasLoader]);

  // Memoize dynamic component so it doesn't remount on re-renders
  const DynamicComponent = useMemo(() => {
    if (!loader) return null;
    return dynamic(loader, {
      loading: () => (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading tool..." />
        </div>
      ),
      ssr: false,
    });
  }, [loader]);

  if (!DynamicComponent) {
    return <div className="p-8 text-center">Tool component not found for {toolId}</div>;
  }

  // Handle special cases with props
  const getToolProps = () => {
    return props;
  };

  return (
    <ErrorBoundary>
      <DynamicComponent {...getToolProps()} />
    </ErrorBoundary>
  );
}
