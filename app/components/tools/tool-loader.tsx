"use client";
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { useEffect, useMemo } from 'react';
import { ErrorBoundary } from '@/app/components/shared/ErrorBoundary';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';
import { trackToolOpened, trackEvent } from '@/app/lib/telemetry';
import { recordToolUse } from '@/app/hooks/useRecentTools';

// Tool component mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolComponentLoader = () => Promise<{ default: ComponentType<any> }>;
const toolComponents: Record<string, ToolComponentLoader> = {
  'dev-station': () => import('@/app/components/tools/developer/dev-station'),
  'smart-excel': () => import('@/app/components/tools/documents/csv-studio').then(mod => ({ default: mod.CsvStudio })),
  'smart-word': () => import('@/app/components/tools/documents/markdown-studio').then(mod => ({ default: mod.MarkdownStudio })),
  'universal-converter': () => import('@/app/components/tools/documents/universal-converter').then(mod => ({ default: mod.UniversalConverter })),
  'smart-budget': () => import('@/app/components/tools/finance/budget-planner').then(mod => ({ default: mod.BudgetPlanner })),

  'smart-loan': () => import('@/app/components/tools/finance/smart-loan-enhanced').then(mod => ({ default: mod.SmartLoanEnhanced })),
  'smart-sip': () => import('@/app/components/tools/finance/sip-calculator').then(mod => ({ default: mod.SipCalculator })),
  'gst-calculator': () => import('@/app/components/tools/finance/gst-calculator').then(mod => ({ default: mod.GstCalculator })),
  'smart-net-worth': () => import('@/app/components/tools/finance/net-worth').then(mod => ({ default: mod.NetWorthTracker })),
  'smart-retirement': () => import('@/app/components/tools/finance/retirement-planner').then(mod => ({ default: mod.RetirementPlanner })),
  'unit-convert': () => import('@/app/components/tools/converters/unit-converter').then(mod => ({ default: mod.UnitConverter })),
  'smart-scan': () => import('@/app/components/tools/documents/smart-scan').then(mod => ({ default: mod.SmartScan })),
  'case-convert': () => import('@/app/components/tools/engines/text-transformer').then(mod => ({ default: mod.TextTransformer })),
  'smart-json': () => import('@/app/components/tools/developer/smart-editor').then(mod => ({ default: mod.SmartEditor })),
  'smart-sql': () => import('@/app/components/tools/developer/smart-editor').then(mod => ({ default: mod.SmartEditor })),
  'smart-uuid': () => import('@/app/components/tools/developer/string-studio').then(mod => ({ default: mod.StringStudio })),
  'smart-base64': () => import('@/app/components/tools/developer/string-studio').then(mod => ({ default: mod.StringStudio })),
  'smart-url': () => import('@/app/components/tools/developer/string-studio').then(mod => ({ default: mod.StringStudio })),
  'smart-html-entities': () => import('@/app/components/tools/developer/string-studio').then(mod => ({ default: mod.StringStudio })),
  'smart-diff': () => import('@/app/components/tools/developer/diff-studio').then(mod => ({ default: mod.DiffStudio })),
  'smart-bmi': () => import('@/app/components/tools/health/smart-bmi').then(mod => ({ default: mod.SmartBMI })),
  'smart-breath': () => import('@/app/components/tools/health/box-breathing').then(mod => ({ default: mod.BoxBreathing })),
  'smart-workout': () => import('@/app/components/tools/health/hiit-timer').then(mod => ({ default: mod.HIITTimer })),
  'smart-chat': () => import('@/app/components/tools/ai/ai-chat').then(mod => ({ default: mod.AIChat })),
  'smart-analyze': () => import('@/app/components/tools/ai/sentiment-analyzer').then(mod => ({ default: mod.SentimentAI })),
  'prompt-generator': () => import('@/app/components/tools/ai/prompt-generator').then(mod => ({ default: mod.PromptGenerator })),
  'color-picker': () => import('@/app/components/tools/design/color-picker').then(mod => ({ default: mod.ColorPicker })),
  'color-studio': () => import('@/app/components/tools/design/color-studio').then(mod => ({ default: mod.ColorStudio })),
  'rent-receipt': () => import('@/app/components/tools/business/rent-receipt').then(mod => ({ default: mod.RentReceiptGenerator })),
  'salary-slip': () => import('@/app/components/tools/business/salary-slip').then(mod => ({ default: mod.SalarySlipGenerator })),
  'invoice-generator': () => import('@/app/components/tools/business/invoice-generator').then(mod => ({ default: mod.InvoiceGenerator })),
  'id-card': () => import('@/app/components/tools/business/id-card-maker').then(mod => ({ default: mod.IdCardMaker })),
  'smart-agreement': () => import('@/app/components/tools/business/agreement-builder').then(mod => ({ default: mod.AgreementBuilder })),
  'smart-pdf-merge': () => import('@/app/components/tools/documents/pdf-workbench').then(mod => ({ default: mod.PdfWorkbench })),
  'smart-img-compress': () => import('@/app/components/tools/documents/image-compressor').then(mod => ({ default: mod.ImageCompressor })),
  'smart-ocr': () => import('@/app/components/tools/documents/smart-ocr').then(mod => ({ default: mod.SmartOCR })),
  'smart-img-convert': () => import('@/app/components/tools/documents/image-converter').then(mod => ({ default: mod.ImageConverter })),
  'smart-pdf-split': () => import('@/app/components/tools/documents/pdf-splitter').then(mod => ({ default: mod.PdfSplitter })),
  'life-os': () => import('@/app/components/tools/productivity/life-os').then(mod => ({ default: mod.LifeOS })),
  'qr-code': () => import('@/app/components/tools/productivity/qr-generator').then(mod => ({ default: mod.QrGenerator })),
  'smart-pass': () => import('@/app/components/tools/productivity/password-generator').then(mod => ({ default: mod.PasswordGenerator })),
  'pomodoro': () => import('@/app/components/tools/productivity/pomodoro').then(mod => ({ default: mod.Pomodoro })),
  'api-playground': () => import('@/app/components/tools/developer/api-playground').then(mod => ({ default: mod.ApiPlayground })),
  'smart-jwt': () => import('@/app/components/tools/developer/jwt-debugger').then(mod => ({ default: mod.JwtDebugger })),
  'cron-gen': () => import('@/app/components/tools/developer/cron-gen').then(mod => ({ default: mod.CronGenerator })),
  'git-cheats': () => import('@/app/components/tools/developer/git-cheats').then(mod => ({ default: mod.GitCheats })),
  'regex-tester': () => import('@/app/components/tools/developer/regex-tester').then(mod => ({ default: mod.RegexTester })),
  'hash-gen': () => import('@/app/components/tools/developer/hash-gen').then(mod => ({ default: mod.HashGenerator })),
  'num-convert': () => import('@/app/components/tools/developer/num-convert').then(mod => ({ default: mod.NumConverter })),
  'timestamp-tool': () => import('@/app/components/tools/developer/timestamp-tool').then(mod => ({ default: mod.TimestampTool })),
  'audio-transcription': () => import('@/app/components/tools/creator/audio-transcription').then(mod => ({ default: mod.AudioTranscription })),
  'video-downloader': () => import('@/app/components/tools/creator/video-downloader').then(mod => ({ default: mod.VideoDownloader })),
  'instagram-transcript': () => import('@/app/components/tools/creator/instagram-transcript').then(mod => ({ default: mod.InstagramTranscript })),
  'self-serve-analytics': () => import('@/app/components/tools/analytics/self-serve-analytics').then(mod => ({ default: mod.SelfServeAnalytics })),
  // Personal Finance
  'pf-statement-manager': () => import('@/app/components/tools/personal-finance/pf-statement-manager').then(mod => ({ default: mod.StatementManager })),
  'pf-financial-position': () => import('@/app/components/tools/personal-finance/pf-financial-position').then(mod => ({ default: mod.FinancialPosition })),
  'pf-cash-flow': () => import('@/app/components/tools/personal-finance/pf-cash-flow').then(mod => ({ default: mod.Income })),
  'pf-tx-explorer': () => import('@/app/components/tools/personal-finance/pf-transaction-explorer').then(mod => ({ default: mod.TransactionExplorer })),
  'pf-expenditure': () => import('@/app/components/tools/personal-finance/pf-expenditure').then(mod => ({ default: mod.ExpenditureDistribution })),
  'pf-expenses': () => import('@/app/components/tools/personal-finance/pf-expenses').then(mod => ({ default: mod.Expenses })),
  'pf-commitments': () => import('@/app/components/tools/personal-finance/pf-commitments').then(mod => ({ default: mod.CommitmentsRegister })),
  'pf-recurring': () => import('@/app/components/tools/personal-finance/pf-recurring-payments').then(mod => ({ default: mod.RecurringPayments })),
  'pf-top-merchants': () => import('@/app/components/tools/personal-finance/pf-top-merchants').then(mod => ({ default: mod.TopMerchants })),
  'pf-big-spends': () => import('@/app/components/tools/personal-finance/pf-big-spends').then(mod => ({ default: mod.BigSpends })),
  'pf-rules': () => import('@/app/components/tools/personal-finance/pf-rules').then(mod => ({ default: mod.CategoryRules })),
  'pf-income-sources': () => import('@/app/components/tools/personal-finance/pf-income-sources').then(mod => ({ default: mod.IncomeSources })),
  'pf-behavior': () => import('@/app/components/tools/personal-finance/pf-behavior').then(mod => ({ default: mod.SpendingBehavior })),
  'pf-savings-trend': () => import('@/app/components/tools/personal-finance/pf-savings-trend').then(mod => ({ default: mod.SavingsTrend })),
  'pf-month-compare': () => import('@/app/components/tools/personal-finance/pf-month-compare').then(mod => ({ default: mod.MonthComparison })),
  'pf-heatmap': () => import('@/app/components/tools/personal-finance/pf-heatmap').then(mod => ({ default: mod.SpendingHeatmap })),
  'pf-subscriptions': () => import('@/app/components/tools/personal-finance/pf-subscriptions').then(mod => ({ default: mod.SubscriptionFinder })),
  'pf-labels': () => import('@/app/components/tools/personal-finance/pf-labels').then(mod => ({ default: mod.LabelManager })),
  'pf-liability': () => import('@/app/components/tools/personal-finance/pf-liability').then(mod => ({ default: mod.LiabilityLedger })),
  'pf-ai-analyst': () => import('@/app/components/tools/personal-finance/pf-ai-analyst').then(mod => ({ default: mod.PFAIAnalyst })),
  'pf-health-score': () => import('@/app/components/tools/personal-finance/pf-health-score').then(mod => ({ default: mod.FinancialHealthScore })),
  'pf-spending-dna': () => import('@/app/components/tools/personal-finance/pf-spending-dna').then(mod => ({ default: mod.SpendingDNA })),
  'pf-investment-tracker': () => import('@/app/components/tools/personal-finance/pf-investment-tracker').then(mod => ({ default: mod.PFInvestmentTracker })),
  'pf-budget-vs-actual': () => import('@/app/components/tools/personal-finance/pf-budget-vs-actual').then(mod => ({ default: mod.BudgetVsActual })),
  'pf-financial-snapshot': () => import('@/app/components/tools/personal-finance/pf-financial-snapshot').then(mod => ({ default: mod.PFFinancialSnapshot })),
  // Finance — new tools
  'fire-calc': () => import('@/app/components/tools/finance/fire-calculator').then(mod => ({ default: mod.FireCalculator })),
  'cost-of-delay': () => import('@/app/components/tools/finance/cost-of-delay').then(mod => ({ default: mod.CostOfDelay })),
  'debt-planner': () => import('@/app/components/tools/finance/debt-planner').then(mod => ({ default: mod.DebtPlanner })),
  'portfolio-rebalance': () => import('@/app/components/tools/finance/portfolio-rebalance').then(mod => ({ default: mod.PortfolioRebalance })),
  'ctc-calc': () => import('@/app/components/tools/finance/ctc-calculator').then(mod => ({ default: mod.CTCCalculator })),
  'hra-calc': () => import('@/app/components/tools/finance/hra-calculator').then(mod => ({ default: mod.HRACalculator })),
  'gratuity-calc': () => import('@/app/components/tools/finance/gratuity-calculator').then(mod => ({ default: mod.GratuityCalculator })),
  'capital-gains-calc': () => import('@/app/components/tools/finance/capital-gains-calc').then(mod => ({ default: mod.CapitalGainsCalc })),
  'tax-saving-compare': () => import('@/app/components/tools/finance/tax-saving-compare').then(mod => ({ default: mod.TaxSavingCompare })),
  'sub-audit': () => import('@/app/components/tools/finance/sub-audit').then(mod => ({ default: mod.SubscriptionAudit })),
  'wedding-budget': () => import('@/app/components/tools/finance/wedding-budget').then(mod => ({ default: mod.WeddingBudget })),
  'salary-nego': () => import('@/app/components/tools/finance/salary-nego').then(mod => ({ default: mod.SalaryNego })),
  'fd-calculator': () => import('@/app/components/tools/finance/fd-calculator').then(mod => ({ default: mod.FDCalculator })),
  'nps-calculator': () => import('@/app/components/tools/finance/nps-calculator').then(mod => ({ default: mod.NPSCalculator })),
  'ppf-calculator': () => import('@/app/components/tools/finance/ppf-calculator').then(mod => ({ default: mod.PPFCalculator })),
  // GST & Tax
  'tds-finder': () => import('@/app/components/tools/gst-tax/tds-finder').then(mod => ({ default: mod.TdsFinder })),
  'deduction-tracker': () => import('@/app/components/tools/gst-tax/deduction-tracker').then(mod => ({ default: mod.DeductionTracker })),
  'tax-calendar': () => import('@/app/components/tools/gst-tax/tax-calendar').then(mod => ({ default: mod.TaxCalendar })),
  'advance-tax-calc': () => import('@/app/components/tools/gst-tax/advance-tax-calc').then(mod => ({ default: mod.AdvanceTaxCalc })),
  'income-tax-calc': () => import('@/app/components/tools/gst-tax/income-tax-calc').then(mod => ({ default: mod.IncomeTaxCalc })),
  'itr-checklist': () => import('@/app/components/tools/gst-tax/itr-checklist').then(mod => ({ default: mod.ITRChecklist })),
  // Real Estate
  'home-loan-emi': () => import('@/app/components/tools/real-estate/home-loan-emi').then(mod => ({ default: mod.HomeLoanEmi })),
  'rent-vs-buy': () => import('@/app/components/tools/real-estate/rent-vs-buy').then(mod => ({ default: mod.RentVsBuy })),
  'rental-yield': () => import('@/app/components/tools/real-estate/rental-yield').then(mod => ({ default: mod.RentalYield })),
  'stamp-duty': () => import('@/app/components/tools/real-estate/stamp-duty').then(mod => ({ default: mod.StampDuty })),
  'property-budget': () => import('@/app/components/tools/real-estate/property-budget').then(mod => ({ default: mod.PropertyBudget })),
  // Career
  'job-offer-compare': () => import('@/app/components/tools/career/job-offer-compare').then(mod => ({ default: mod.JobOfferCompare })),
  'freelance-rate': () => import('@/app/components/tools/career/freelance-rate').then(mod => ({ default: mod.FreelanceRate })),
  'fnf-calculator': () => import('@/app/components/tools/career/fnf-calculator').then(mod => ({ default: mod.FnFCalculator })),
  'wfh-savings': () => import('@/app/components/tools/career/wfh-savings').then(mod => ({ default: mod.WfhSavings })),
  'salary-history': () => import('@/app/components/tools/career/salary-history').then(mod => ({ default: mod.SalaryHistory })),
  'esop-value-calc': () => import('@/app/components/tools/career/esop-value-calc').then(mod => ({ default: mod.ESOPValueCalc })),
  'career-roi-calc': () => import('@/app/components/tools/career/career-roi-calc').then(mod => ({ default: mod.CareerROICalc })),
  // Startup
  'burn-rate': () => import('@/app/components/tools/startup/burn-rate').then(mod => ({ default: mod.BurnRate })),
  'equity-dilution': () => import('@/app/components/tools/startup/equity-dilution').then(mod => ({ default: mod.EquityDilution })),
  'saas-metrics': () => import('@/app/components/tools/startup/saas-metrics').then(mod => ({ default: mod.SaasMetrics })),
  'project-pricing': () => import('@/app/components/tools/startup/project-pricing').then(mod => ({ default: mod.ProjectPricing })),
  // Travel
  'trip-budget': () => import('@/app/components/tools/travel/trip-budget').then(mod => ({ default: mod.TripBudget })),
  'road-trip': () => import('@/app/components/tools/travel/road-trip').then(mod => ({ default: mod.RoadTrip })),
  'forex-calc': () => import('@/app/components/tools/travel/forex-calc').then(mod => ({ default: mod.ForexCalc })),
  'ev-vs-petrol': () => import('@/app/components/tools/travel/ev-vs-petrol').then(mod => ({ default: mod.EvVsPetrol })),
  // Personal CRM
  'crm-people': () => import('@/app/components/tools/personal-crm/crm-people').then(mod => ({ default: mod.CRMPeople })),
  // Business CRM
  'biz-crm-pipeline': () => import('@/app/components/tools/biz-crm/biz-crm-pipeline').then(mod => ({ default: mod.BizCRMPipeline })),
  // Business OS
  'biz-dashboard': () => import('@/app/components/tools/business-os/biz-dashboard').then(mod => ({ default: mod.BizDashboard })),
  'biz-daybook': () => import('@/app/components/tools/business-os/biz-daybook').then(mod => ({ default: mod.BizDaybook })),
  'biz-parties': () => import('@/app/components/tools/business-os/biz-parties').then(mod => ({ default: mod.BizParties })),
  'biz-inventory': () => import('@/app/components/tools/business-os/biz-inventory').then(mod => ({ default: mod.BizInventory })),
  'biz-invoices': () => import('@/app/components/tools/business-os/biz-invoices').then(mod => ({ default: mod.BizInvoices })),
  'biz-reports': () => import('@/app/components/tools/business-os/biz-reports').then(mod => ({ default: mod.BizReports })),
  'biz-products': () => import('@/app/components/tools/business-os/biz-products').then(mod => ({ default: mod.BizProducts })),
  'biz-stock-entry': () => import('@/app/components/tools/business-os/biz-stock-entry').then(mod => ({ default: mod.BizStockEntry })),
  'biz-outstanding': () => import('@/app/components/tools/business-os/biz-outstanding').then(mod => ({ default: mod.BizOutstanding })),
  'biz-purchases': () => import('@/app/components/tools/business-os/biz-purchases').then(mod => ({ default: mod.BizPurchases })),
  'biz-quotations': () => import('@/app/components/tools/business-os/biz-quotations').then(mod => ({ default: mod.BizQuotations })),
  'biz-staff': () => import('@/app/components/tools/business-os/biz-staff').then(mod => ({ default: mod.BizStaff })),
  'biz-gst': () => import('@/app/components/tools/business-os/biz-gst').then(mod => ({ default: mod.BizGST })),
  'biz-cashflow': () => import('@/app/components/tools/business-os/biz-cashflow').then(mod => ({ default: mod.BizCashflow })),
  'biz-loans': () => import('@/app/components/tools/business-os/biz-loans').then(mod => ({ default: mod.BizLoans })),
  'biz-reconcile': () => import('@/app/components/tools/business-os/biz-reconcile').then(mod => ({ default: mod.BizReconcile })),
  // Productivity — new
  'habit-tracker': () => import('@/app/components/tools/productivity/habit-tracker').then(mod => ({ default: mod.HabitTracker })),
  // Health — new
  'calorie-calculator': () => import('@/app/components/tools/health/calorie-calculator').then(mod => ({ default: mod.CalorieCalculator })),
  'water-tracker': () => import('@/app/components/tools/health/water-tracker').then(mod => ({ default: mod.WaterTracker })),
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
      recordToolUse(toolId);
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
    if (toolId === 'smart-json') return { toolId: "json", title: "JSON Editor", ...props };
    if (toolId === 'smart-sql') return { toolId: "sql", title: "SQL Formatter", ...props };
    if (toolId === 'case-convert') return { toolId: "case", title: "Case Converter", ...props };
    return props;
  };

  return (
    <ErrorBoundary>
      <DynamicComponent {...getToolProps()} />
    </ErrorBoundary>
  );
}
