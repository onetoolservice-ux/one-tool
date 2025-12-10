import React from 'react';
import { notFound } from 'next/navigation';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import ToolShell from '@/app/components/tools/tool-shell';
import type { Metadata } from 'next';

// --- IMPORTS (ALL TOOLS PRESERVED) ---
import { DevStation } from '@/app/components/tools/developer/dev-station';
import { CsvStudio } from '@/app/components/tools/documents/csv-studio';
import { MarkdownStudio } from '@/app/components/tools/documents/markdown-studio';
import { UniversalConverter } from '@/app/components/tools/documents/universal-converter';
import { BudgetPlanner } from '@/app/components/tools/finance/budget-planner';
import { InvestmentCalculator } from '@/app/components/tools/finance/investment-calculator';
import { GstCalculator } from '@/app/components/tools/finance/gst-calculator';
import { NetWorthTracker } from '@/app/components/tools/finance/net-worth';
import { RetirementPlanner } from '@/app/components/tools/finance/retirement-planner';
import { UnitConverter } from '@/app/components/tools/converters/unit-converter';
import { SmartScan } from '@/app/components/tools/documents/smart-scan';
import { TextTransformer } from '@/app/components/tools/engines/text-transformer';
import { SmartEditor } from '@/app/components/tools/developer/smart-editor';
import { StringStudio } from '@/app/components/tools/developer/string-studio';
import { DiffStudio } from '@/app/components/tools/developer/diff-studio';
import { SmartBMI } from '@/app/components/tools/health/smart-bmi';
import { BoxBreathing } from '@/app/components/tools/health/box-breathing';
import { HIITTimer } from '@/app/components/tools/health/hiit-timer';
import { AIChat } from '@/app/components/tools/ai/ai-chat';
import { SentimentAI } from '@/app/components/tools/ai/sentiment-analyzer';
import { ColorPicker } from '@/app/components/tools/design/color-picker';
import { RentReceiptGenerator } from '@/app/components/tools/business/rent-receipt';
import { SalarySlipGenerator } from '@/app/components/tools/business/salary-slip';
import { InvoiceGenerator } from '@/app/components/tools/business/invoice-generator';
import { IdCardMaker } from '@/app/components/tools/business/id-card-maker';
import { AgreementBuilder } from '@/app/components/tools/business/agreement-builder';
import { PdfWorkbench } from '@/app/components/tools/documents/pdf-workbench';
import { ImageCompressor } from '@/app/components/tools/documents/image-compressor';
import { SmartOCR } from '@/app/components/tools/documents/smart-ocr';
import { ImageConverter } from '@/app/components/tools/documents/image-converter';
import { PdfSplitter } from '@/app/components/tools/documents/pdf-splitter';
import { LifeOS } from '@/app/components/tools/productivity/life-os';
import { QrGenerator } from '@/app/components/tools/productivity/qr-generator';
import { PasswordGenerator } from '@/app/components/tools/productivity/password-generator';
import { Pomodoro } from '@/app/components/tools/productivity/pomodoro';
import { ApiPlayground } from '@/app/components/tools/developer/api-playground';
import { JwtDebugger } from '@/app/components/tools/developer/jwt-debugger';
import { CronGenerator } from '@/app/components/tools/developer/cron-gen';
import { GitCheats } from '@/app/components/tools/developer/git-cheats';
import { TextEngine } from '@/app/components/tools/engines/text-engine';
import { FileEngine } from '@/app/components/tools/engines/file-engine';
import { MathEngine } from '@/app/components/tools/engines/math-engine';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const tool = ALL_TOOLS.find((t) => t.id === resolvedParams.id);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} - Free Online Tool | OneTool`,
    description: tool.desc,
    alternates: { canonical: `https://onetool.com/tools/${tool.category.toLowerCase()}/${tool.id}` }
  };
}

export default async function ToolPage(props: { params: Promise<{ category: string; id: string }> }) {
  const params = await props.params;
  const tool = ALL_TOOLS.find((t) => t.id === params.id);
  if (!tool) return notFound();

  // FIX: Schema as pure JSON object
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.desc,
    applicationCategory: tool.category,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  let ToolComponent;
  // --- COMPONENT LOGIC ---
  if (tool.id === 'smart-bmi') ToolComponent = <SmartBMI />;
  else if (tool.id === 'smart-breath') ToolComponent = <BoxBreathing />;
  else if (tool.id === 'smart-workout') ToolComponent = <HIITTimer />;
  else if (tool.id === 'smart-chat') ToolComponent = <AIChat />;
  else if (tool.id === 'smart-analyze') ToolComponent = <SentimentAI />;
  else if (tool.id === 'color-picker') ToolComponent = <ColorPicker />;
  else if (tool.id === 'smart-word') ToolComponent = <MarkdownStudio />;
  else if (tool.id === 'smart-excel') ToolComponent = <CsvStudio />;
  else if (tool.id === 'dev-station') ToolComponent = <DevStation />;
  else if (tool.id === 'invoice-generator') ToolComponent = <InvoiceGenerator />;
  else if (tool.id === 'salary-slip') ToolComponent = <SalarySlipGenerator />;
  else if (tool.id === 'rent-receipt') ToolComponent = <RentReceiptGenerator />;
  else if (tool.id === 'id-card') ToolComponent = <IdCardMaker />;
  else if (tool.id === 'smart-agreement') ToolComponent = <AgreementBuilder />;
  else if (tool.id === 'smart-budget') ToolComponent = <BudgetPlanner />;
  else if (tool.id === 'gst-calculator') ToolComponent = <GstCalculator />;
  else if (tool.id === 'smart-net-worth') ToolComponent = <NetWorthTracker />;
  else if (tool.id === 'smart-retirement') ToolComponent = <RetirementPlanner />;
  else if (tool.id.startsWith('smart-loan') || tool.id.startsWith('smart-sip')) ToolComponent = <InvestmentCalculator mode={tool.id.replace('smart-','')} />;
  else if (tool.id === 'universal-converter' || tool.id === 'json-csv') ToolComponent = <UniversalConverter title={tool.name} subtitle={tool.desc} />;
  else if (tool.id === 'smart-scan') ToolComponent = <SmartScan />;
  else if (tool.id === 'smart-pdf-merge') ToolComponent = <PdfWorkbench />;
  else if (tool.id === 'smart-pdf-split') ToolComponent = <PdfSplitter />;
  else if (tool.id === 'smart-img-compress') ToolComponent = <ImageCompressor />;
  else if (tool.id === 'smart-img-convert') ToolComponent = <ImageConverter />;
  else if (tool.id === 'smart-ocr') ToolComponent = <SmartOCR />;
  else if (['smart-url', 'smart-base64', 'smart-uuid', 'smart-html-entities'].includes(tool.id)) ToolComponent = <StringStudio toolId={tool.id} />;
  else if (tool.id.includes('json') || tool.id.includes('sql')) ToolComponent = <SmartEditor toolId={tool.id} />;
  else if (tool.id === 'api-playground') ToolComponent = <ApiPlayground />;
  else if (tool.id === 'smart-jwt') ToolComponent = <JwtDebugger />;
  else if (tool.id === 'cron-gen') ToolComponent = <CronGenerator />;
  else if (tool.id === 'git-cheats') ToolComponent = <GitCheats />;
  else if (tool.id === 'smart-diff') ToolComponent = <DiffStudio />;
  else if (tool.id === 'unit-convert') ToolComponent = <UnitConverter />;
  else if (tool.id === 'case-convert') ToolComponent = <TextTransformer toolId={tool.id} title={tool.name} />;
  else if (tool.id === 'life-os') ToolComponent = <LifeOS />;
  else if (tool.id === 'qr-code') ToolComponent = <QrGenerator />;
  else if (tool.id === 'smart-pass') ToolComponent = <PasswordGenerator />;
  else if (tool.id === 'pomodoro') ToolComponent = <Pomodoro />;
  else if (tool.category === 'Documents') ToolComponent = <FileEngine toolId={tool.id} title={tool.name} />;
  else if (tool.category === 'Converters') ToolComponent = <MathEngine toolId={tool.id} />;
  else ToolComponent = <TextEngine toolId={tool.id} title={tool.name} description={tool.desc} />;

  const serializedTool = {
    name: tool.name || tool.title,
    desc: tool.desc || tool.description,
    category: tool.category,
    id: tool.id
  };

  return (
    <>
      {/* FIX: Using standard <script> tag ensures raw HTML output that Google ALWAYS sees */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolShell tool={serializedTool}>{ToolComponent}</ToolShell>
    </>
  );
}
