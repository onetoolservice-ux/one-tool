"use client";
import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { ToolShell } from '@/app/components/tools/tool-shell';

// IMPORT COMPONENTS
import { UniversalConverter } from '@/app/components/tools/documents/universal-converter';
import { BudgetPlanner } from '@/app/components/tools/finance/budget-planner';
import { UnitConverter } from '@/app/components/tools/converters/unit-converter';
import { SmartScan } from '@/app/components/tools/documents/smart-scan';
import { TextTransformer } from '@/app/components/tools/engines/text-transformer';
import { SmartEditor } from '@/app/components/tools/developer/smart-editor';
import { HealthStation } from '@/app/components/tools/engines/health-station';
import { FileEngine } from '@/app/components/tools/engines/file-engine';
import { MathEngine } from '@/app/components/tools/engines/math-engine';
import { TextEngine } from '@/app/components/tools/engines/text-engine';
import { StringStudio } from '@/app/components/tools/developer/string-studio';
import { ColorStudio } from '@/app/components/tools/design/color-studio';
import { DiffStudio } from '@/app/components/tools/developer/diff-studio';
import { AiStudio } from '@/app/components/tools/ai/ai-studio';

// HEROES
import { SalarySlipGenerator } from '@/app/components/tools/business/salary-slip';
import { AgreementBuilder } from '@/app/components/tools/business/agreement-builder';
import { InvoiceGenerator } from '@/app/components/tools/business/invoice-generator';
import { IdCardMaker } from '@/app/components/tools/business/id-card-maker';
import { RentReceiptGenerator } from '@/app/components/tools/business/rent-receipt';
import { PdfWorkbench } from '@/app/components/tools/documents/pdf-workbench';
import { PdfSplitter } from '@/app/components/tools/documents/pdf-splitter';
import { SmartExcel } from '@/app/components/tools/documents/smart-excel';
import { ImageConverter } from '@/app/components/tools/documents/image-converter';
import { ImageCompressor } from '@/app/components/tools/documents/image-compressor';
import { SmartWord } from '@/app/components/tools/documents/smart-word';
import { SmartOCR } from '@/app/components/tools/documents/smart-ocr';
import { FinanceCalculator } from '@/app/components/tools/finance/finance-calculator';
import { InvestmentCalculator } from '@/app/components/tools/finance/investment-calculator';
import { QrGenerator } from '@/app/components/tools/productivity/qr-generator';
import { PasswordGenerator } from '@/app/components/tools/productivity/password-generator';
import { LifeOS } from '@/app/components/tools/productivity/life-os';
import { ApiPlayground } from '@/app/components/tools/developer/api-playground';
import { JwtDebugger } from '@/app/components/tools/developer/jwt-debugger';
import { CronGenerator } from '@/app/components/tools/developer/cron-gen';
import { GitCheats } from '@/app/components/tools/developer/git-cheats';

export default function ToolPage(props: { params: Promise<{ category: string; id: string }> }) {
  const params = use(props.params);
  const tool = ALL_TOOLS.find((t) => t.id === params.id);
  
  if (!tool) return notFound();

  let ToolComponent;

  // --- EXPLICIT MATCHING ---
  if (tool.id === 'universal-converter') ToolComponent = <UniversalConverter title="Universal Converter" subtitle="Images, Docs & Audio" />;
  else if (tool.id === 'json-csv') ToolComponent = <UniversalConverter defaultCategory="Code" title="Data Transformer" subtitle="JSON ↔ CSV" />;
  else if (tool.id === 'smart-budget') ToolComponent = <BudgetPlanner />;
  else if (tool.id === 'unit-convert') ToolComponent = <UnitConverter />;
  else if (tool.id === 'case-convert') ToolComponent = <TextTransformer toolId={tool.id} title={tool.name} />; // FIXED
  
  else if (tool.id === 'smart-json' || tool.id === 'smart-sql') ToolComponent = <SmartEditor toolId={tool.id} />;
  else if (tool.id === 'smart-scan') ToolComponent = <SmartScan />;

  // ... (Heroes)
  else if (tool.id === 'salary-slip') ToolComponent = <SalarySlipGenerator />;
  else if (tool.id === 'invoice-generator') ToolComponent = <InvoiceGenerator />;
  else if (tool.id === 'smart-pdf-merge') ToolComponent = <PdfWorkbench />;
  else if (tool.id === 'life-os') ToolComponent = <LifeOS />;
  
  // Fallbacks
  else if (tool.category === 'Documents') ToolComponent = <FileEngine toolId={tool.id} title={tool.name} />;
  else if (tool.category === 'Converters') ToolComponent = <MathEngine toolId={tool.id} />;
  else if (tool.id.includes('chat')) ToolComponent = <AiStudio toolId={tool.id} />;
  else ToolComponent = <TextEngine toolId={tool.id} title={tool.name} description={tool.desc} />;

  return <ToolShell tool={tool}>{ToolComponent}</ToolShell>;
}