"use client";
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { ErrorBoundary } from '@/app/components/shared/ErrorBoundary';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';

// Tool component mapping
const toolComponents: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  'dev-station': () => import('@/app/components/tools/developer/dev-station'),
  'smart-excel': () => import('@/app/components/tools/documents/csv-studio').then(mod => ({ default: mod.CsvStudio })),
  'smart-word': () => import('@/app/components/tools/documents/markdown-studio').then(mod => ({ default: mod.MarkdownStudio })),
  'universal-converter': () => import('@/app/components/tools/documents/universal-converter').then(mod => ({ default: mod.UniversalConverter })),
  'smart-budget': () => import('@/app/components/tools/finance/budget-planner').then(mod => ({ default: mod.BudgetPlanner })),
  'smart-loan': () => import('@/app/components/tools/finance/investment-calculator').then(mod => ({ default: mod.InvestmentCalculator })),
  'smart-sip': () => import('@/app/components/tools/finance/investment-calculator').then(mod => ({ default: mod.InvestmentCalculator })),
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
};

interface ToolLoaderProps {
  toolId: string;
  [key: string]: any;
}

export function ToolLoader({ toolId, ...props }: ToolLoaderProps) {
  const loader = toolComponents[toolId];
  
  if (!loader) {
    return <div className="p-8 text-center">Tool component not found for {toolId}</div>;
  }

  const DynamicComponent = dynamic(loader, {
    loading: () => <div className="p-8 text-center">Loading tool...</div>,
  });

  // Wrap component with Error Boundary
  const WrappedComponent = () => {
    // Handle special cases with props
    if (toolId === 'smart-loan') {
      return <DynamicComponent mode="loan" {...props} />;
    }
    if (toolId === 'smart-sip') {
      return <DynamicComponent mode="sip" {...props} />;
    }
    if (toolId === 'smart-json') {
      return <DynamicComponent toolId="json" title="JSON Editor" {...props} />;
    }
    if (toolId === 'smart-sql') {
      return <DynamicComponent toolId="sql" title="SQL Formatter" {...props} />;
    }
    if (toolId === 'case-convert') {
      return <DynamicComponent toolId="case" title="Case Converter" {...props} />;
    }

    return <DynamicComponent {...props} />;
  };

  return (
    <ErrorBoundary>
      <WrappedComponent />
    </ErrorBoundary>
  );
}
