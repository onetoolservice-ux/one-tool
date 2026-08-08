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
  'dev-station': () => import('@/app/components/tools/developer/DevStation'),
  'smart-excel': () => import('@/app/components/tools/documents/CsvStudio').then(mod => ({ default: mod.CsvStudio })),
  'smart-word': () => import('@/app/components/tools/documents/MarkdownStudio').then(mod => ({ default: mod.MarkdownStudio })),
  'universal-converter': () => import('@/app/components/tools/documents/UniversalConverter').then(mod => ({ default: mod.UniversalConverter })),
  'smart-budget': () => import('@/app/components/tools/finance/BudgetPlanner').then(mod => ({ default: mod.BudgetPlanner })),

  'smart-loan': () => import('@/app/components/tools/finance/SmartLoanEnhanced').then(mod => ({ default: mod.SmartLoanEnhanced })),
  'smart-sip': () => import('@/app/components/tools/finance/SipCalculator').then(mod => ({ default: mod.SipCalculator })),
  'gst-calculator': () => import('@/app/components/tools/finance/GstCalculator').then(mod => ({ default: mod.GstCalculator })),
  'smart-net-worth': () => import('@/app/components/tools/finance/NetWorth').then(mod => ({ default: mod.NetWorthTracker })),
  'smart-retirement': () => import('@/app/components/tools/finance/RetirementPlanner').then(mod => ({ default: mod.RetirementPlanner })),
  'unit-convert': () => import('@/app/components/tools/converters/UnitConverter').then(mod => ({ default: mod.UnitConverter })),
  'smart-scan': () => import('@/app/components/tools/documents/SmartScan').then(mod => ({ default: mod.SmartScan })),
  'case-convert': () => import('@/app/components/tools/engines/TextTransformer').then(mod => ({ default: mod.TextTransformer })),
  'smart-json': () => import('@/app/components/tools/developer/SmartEditor').then(mod => ({ default: mod.SmartEditor })),
  'smart-sql': () => import('@/app/components/tools/developer/SmartEditor').then(mod => ({ default: mod.SmartEditor })),
  'smart-uuid': () => import('@/app/components/tools/developer/StringStudio').then(mod => ({ default: mod.StringStudio })),
  'smart-base64': () => import('@/app/components/tools/developer/StringStudio').then(mod => ({ default: mod.StringStudio })),
  'smart-url': () => import('@/app/components/tools/developer/StringStudio').then(mod => ({ default: mod.StringStudio })),
  'smart-html-entities': () => import('@/app/components/tools/developer/StringStudio').then(mod => ({ default: mod.StringStudio })),
  'smart-diff': () => import('@/app/components/tools/developer/DiffStudio').then(mod => ({ default: mod.DiffStudio })),
  'smart-bmi': () => import('@/app/components/tools/health/SmartBmi').then(mod => ({ default: mod.SmartBMI })),
  'smart-breath': () => import('@/app/components/tools/health/BoxBreathing').then(mod => ({ default: mod.BoxBreathing })),
  'smart-workout': () => import('@/app/components/tools/health/HiitTimer').then(mod => ({ default: mod.HIITTimer })),
  'smart-chat': () => import('@/app/components/tools/ai/AiChat').then(mod => ({ default: mod.AIChat })),
  'smart-analyze': () => import('@/app/components/tools/ai/SentimentAnalyzer').then(mod => ({ default: mod.SentimentAI })),
  'prompt-generator': () => import('@/app/components/tools/ai/PromptGenerator').then(mod => ({ default: mod.PromptGenerator })),
  'color-picker': () => import('@/app/components/tools/design/ColorPicker').then(mod => ({ default: mod.ColorPicker })),
  'color-studio': () => import('@/app/components/tools/design/ColorStudio').then(mod => ({ default: mod.ColorStudio })),
  'rent-receipt': () => import('@/app/components/tools/business/RentReceipt').then(mod => ({ default: mod.RentReceiptGenerator })),
  'salary-slip': () => import('@/app/components/tools/business/SalarySlip').then(mod => ({ default: mod.SalarySlipGenerator })),
  'invoice-generator': () => import('@/app/components/tools/business/InvoiceGenerator').then(mod => ({ default: mod.InvoiceGenerator })),
  'id-card': () => import('@/app/components/tools/business/IdCardMaker').then(mod => ({ default: mod.IdCardMaker })),
  'smart-agreement': () => import('@/app/components/tools/business/AgreementBuilder').then(mod => ({ default: mod.AgreementBuilder })),
  'smart-pdf-merge': () => import('@/app/components/tools/documents/PdfWorkbench').then(mod => ({ default: mod.PdfWorkbench })),
  'smart-img-compress': () => import('@/app/components/tools/documents/ImageCompressor').then(mod => ({ default: mod.ImageCompressor })),
  'smart-ocr': () => import('@/app/components/tools/documents/SmartOcr').then(mod => ({ default: mod.SmartOCR })),
  'smart-img-convert': () => import('@/app/components/tools/documents/ImageConverter').then(mod => ({ default: mod.ImageConverter })),
  'smart-pdf-split': () => import('@/app/components/tools/documents/PdfSplitter').then(mod => ({ default: mod.PdfSplitter })),
  'second-brain': () => import('@/app/components/tools/productivity/SecondBrain').then(mod => ({ default: mod.SecondBrain })),
  'life-os': () => import('@/app/components/tools/productivity/LifeOs').then(mod => ({ default: mod.LifeOS })),
  'qr-code': () => import('@/app/components/tools/productivity/QrGenerator').then(mod => ({ default: mod.QrGenerator })),
  'smart-pass': () => import('@/app/components/tools/productivity/PasswordGenerator').then(mod => ({ default: mod.PasswordGenerator })),
  'pomodoro': () => import('@/app/components/tools/productivity/pomodoro').then(mod => ({ default: mod.Pomodoro })),
  'api-playground': () => import('@/app/components/tools/developer/ApiPlayground').then(mod => ({ default: mod.ApiPlayground })),
  'smart-jwt': () => import('@/app/components/tools/developer/JwtDebugger').then(mod => ({ default: mod.JwtDebugger })),
  'cron-gen': () => import('@/app/components/tools/developer/CronGen').then(mod => ({ default: mod.CronGenerator })),
  'git-cheats': () => import('@/app/components/tools/developer/GitCheats').then(mod => ({ default: mod.GitCheats })),
  'regex-tester': () => import('@/app/components/tools/developer/RegexTester').then(mod => ({ default: mod.RegexTester })),
  'hash-gen': () => import('@/app/components/tools/developer/HashGen').then(mod => ({ default: mod.HashGenerator })),
  'num-convert': () => import('@/app/components/tools/developer/NumConvert').then(mod => ({ default: mod.NumConverter })),
  'timestamp-tool': () => import('@/app/components/tools/developer/TimestampTool').then(mod => ({ default: mod.TimestampTool })),
  'audio-transcription': () => import('@/app/components/tools/creator/AudioTranscription').then(mod => ({ default: mod.AudioTranscription })),
  'video-downloader': () => import('@/app/components/tools/creator/VideoDownloader').then(mod => ({ default: mod.VideoDownloader })),
  'instagram-transcript': () => import('@/app/components/tools/creator/InstagramTranscript').then(mod => ({ default: mod.InstagramTranscript })),
  'self-serve-analytics': () => import('@/app/components/tools/analytics/SelfServeAnalytics').then(mod => ({ default: mod.SelfServeAnalytics })),
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
  // Real Estate
  'home-loan-emi': () => import('@/app/components/tools/real-estate/HomeLoanEmi').then(mod => ({ default: mod.HomeLoanEmi })),
  'rent-vs-buy': () => import('@/app/components/tools/real-estate/RentVsBuy').then(mod => ({ default: mod.RentVsBuy })),
  'rental-yield': () => import('@/app/components/tools/real-estate/RentalYield').then(mod => ({ default: mod.RentalYield })),
  'stamp-duty': () => import('@/app/components/tools/real-estate/StampDuty').then(mod => ({ default: mod.StampDuty })),
  'property-budget': () => import('@/app/components/tools/real-estate/PropertyBudget').then(mod => ({ default: mod.PropertyBudget })),
  // Bio Data & Resume
  'biodata-maker': () => import('@/app/components/tools/biodata/BiodataMaker').then(mod => ({ default: mod.BiodataMaker })),
  'resume-builder': () => import('@/app/components/tools/biodata/ResumeBuilder').then(mod => ({ default: mod.ResumeBuilder })),
  'cover-letter': () => import('@/app/components/tools/biodata/CoverLetter').then(mod => ({ default: mod.CoverLetter })),
  // Career
  'job-offer-compare': () => import('@/app/components/tools/career/JobOfferCompare').then(mod => ({ default: mod.JobOfferCompare })),
  'freelance-rate': () => import('@/app/components/tools/career/FreelanceRate').then(mod => ({ default: mod.FreelanceRate })),
  'fnf-calculator': () => import('@/app/components/tools/career/FnfCalculator').then(mod => ({ default: mod.FnFCalculator })),
  'wfh-savings': () => import('@/app/components/tools/career/WfhSavings').then(mod => ({ default: mod.WfhSavings })),
  'salary-history': () => import('@/app/components/tools/career/SalaryHistory').then(mod => ({ default: mod.SalaryHistory })),
  'esop-value-calc': () => import('@/app/components/tools/career/EsopValueCalc').then(mod => ({ default: mod.ESOPValueCalc })),
  'career-roi-calc': () => import('@/app/components/tools/career/CareerRoiCalc').then(mod => ({ default: mod.CareerROICalc })),
  // Startup
  'burn-rate': () => import('@/app/components/tools/startup/BurnRate').then(mod => ({ default: mod.BurnRate })),
  'equity-dilution': () => import('@/app/components/tools/startup/EquityDilution').then(mod => ({ default: mod.EquityDilution })),
  'saas-metrics': () => import('@/app/components/tools/startup/SaasMetrics').then(mod => ({ default: mod.SaasMetrics })),
  'project-pricing': () => import('@/app/components/tools/startup/ProjectPricing').then(mod => ({ default: mod.ProjectPricing })),
  // Travel
  'trip-budget': () => import('@/app/components/tools/travel/TripBudget').then(mod => ({ default: mod.TripBudget })),
  'road-trip': () => import('@/app/components/tools/travel/RoadTrip').then(mod => ({ default: mod.RoadTrip })),
  'forex-calc': () => import('@/app/components/tools/travel/ForexCalc').then(mod => ({ default: mod.ForexCalc })),
  'ev-vs-petrol': () => import('@/app/components/tools/travel/EvVsPetrol').then(mod => ({ default: mod.EvVsPetrol })),
  // Personal CRM
  'crm-people': () => import('@/app/components/tools/personal-crm/CrmPeople').then(mod => ({ default: mod.CRMPeople })),
  // Business CRM
  'biz-crm-pipeline': () => import('@/app/components/tools/biz-crm/BizCrmPipeline').then(mod => ({ default: mod.BizCRMPipeline })),
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
  // Productivity — new
  'task-planner': () => import('@/app/components/tools/productivity/TaskPlanner').then(mod => ({ default: mod.TaskPlanner })),
  'habit-tracker': () => import('@/app/components/tools/productivity/HabitTracker').then(mod => ({ default: mod.HabitTracker })),
  'lang-translate': () => import('@/app/components/tools/productivity/LanguageTranslator').then(mod => ({ default: mod.LanguageTranslator })),
  // Health — new
  'calorie-calculator': () => import('@/app/components/tools/health/CalorieCalculator').then(mod => ({ default: mod.CalorieCalculator })),
  'water-tracker': () => import('@/app/components/tools/health/WaterTracker').then(mod => ({ default: mod.WaterTracker })),
  // Writer's OS
  'writer-ideas': () => import('@/app/components/tools/writer/WriterIdeas'),
  'writer-planner': () => import('@/app/components/tools/writer/WriterPlanner'),
  'writer-studio': () => import('@/app/components/tools/writer/WriterStudio'),
  'writer-analyzer': () => import('@/app/components/tools/writer/WriterAnalyzer'),
  'writer-headline': () => import('@/app/components/tools/writer/WriterHeadline'),
  'writer-export': () => import('@/app/components/tools/writer/WriterExport'),
  // Daily Utility
  'smart-cart': () => import('@/app/components/tools/daily-utility/SmartCart').then(mod => ({ default: mod.SmartCart })),
  'grocery-items': () => import('@/app/components/tools/daily-utility/GroceryItems').then(mod => ({ default: mod.GroceryItems })),
  // Astrology
  'kundali-generator':  () => import('@/app/components/tools/astrology/KundaliGenerator').then(mod => ({ default: mod.KundaliGenerator })),
  'panchang-today':     () => import('@/app/components/tools/astrology/PanchangToday').then(mod => ({ default: mod.PanchangToday })),
  'vedic-clock':        () => import('@/app/components/tools/astrology/VedicClock').then(mod => ({ default: mod.VedicClock })),
  'choghadiya':         () => import('@/app/components/tools/astrology/Choghadiya').then(mod => ({ default: mod.Choghadiya })),
  'graha-sthiti':       () => import('@/app/components/tools/astrology/GrahaSthiti').then(mod => ({ default: mod.GrahaSthiti })),
  'muhurta-finder':     () => import('@/app/components/tools/astrology/MuhurtaFinder').then(mod => ({ default: mod.MuhurtaFinder })),
  'panchang-calendar':  () => import('@/app/components/tools/astrology/PanchangCalendar').then(mod => ({ default: mod.PanchangCalendar })),
  'vrat-tyohar':        () => import('@/app/components/tools/astrology/VratTyohar').then(mod => ({ default: mod.VratTyohar })),
  'grahan-tracker':     () => import('@/app/components/tools/astrology/GrahanTracker').then(mod => ({ default: mod.GrahanTracker })),
  'gochar':             () => import('@/app/components/tools/astrology/Gochar').then(mod => ({ default: mod.Gochar })),
  // Time Management
  'time-blocks': () => import('@/app/components/tools/time-management/TimeBlocks').then(mod => ({ default: mod.TimeBlocks })),
  'week-grid': () => import('@/app/components/tools/time-management/WeekGrid').then(mod => ({ default: mod.WeekGrid })),
  'deep-focus': () => import('@/app/components/tools/time-management/DeepFocus').then(mod => ({ default: mod.DeepFocus })),
  'deadline-board': () => import('@/app/components/tools/time-management/DeadlineBoard').then(mod => ({ default: mod.DeadlineBoard })),
  'sprint-timer': () => import('@/app/components/tools/time-management/SprintTimer').then(mod => ({ default: mod.SprintTimer })),
  'time-audit': () => import('@/app/components/tools/time-management/TimeAudit').then(mod => ({ default: mod.TimeAudit })),
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
