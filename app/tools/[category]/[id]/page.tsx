"use client";
import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { ToolShell } from '@/app/components/tools/tool-shell';

// IMPORTS
import { UniversalConverter } from '@/app/components/tools/documents/universal-converter';
import { BudgetPlanner } from '@/app/components/tools/finance/budget-planner';
import { InvestmentCalculator } from '@/app/components/tools/finance/investment-calculator';
import { UnitConverter } from '@/app/components/tools/converters/unit-converter';
import { SmartScan } from '@/app/components/tools/documents/smart-scan';
import { TextTransformer } from '@/app/components/tools/engines/text-transformer';
import { SmartEditor } from '@/app/components/tools/developer/smart-editor';
import { StringStudio } from '@/app/components/tools/developer/string-studio';
import { HealthStation } from '@/app/components/tools/health/health-station';
import { AiStudio } from '@/app/components/tools/ai/ai-studio';
import { ColorStudio } from '@/app/components/tools/design/color-studio';
import { DiffStudio } from '@/app/components/tools/developer/diff-studio';

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
import { SmartExcel } from '@/app/components/tools/documents/smart-excel';
import { SmartWord } from '@/app/components/tools/documents/smart-word';

import { LifeOS } from '@/app/components/tools/productivity/life-os';
import { QrGenerator } from '@/app/components/tools/productivity/qr-generator';
import { PasswordGenerator } from '@/app/components/tools/productivity/password-generator';
import { Pomodoro } from '@/app/components/tools/productivity/pomodoro';
import { ApiPlayground } from '@/app/components/tools/developer/api-playground';
import { JwtDebugger } from '@/app/components/tools/developer/jwt-debugger';
import { CronGenerator } from '@/app/components/tools/developer/cron-gen';
import { GitCheats } from '@/app/components/tools/developer/git-cheats';

import { TextEngine } from '@/app/components/tools/engines/text-engine';

export default function ToolPage(props: { params: Promise<{ category: string; id: string }> }) {
  const params = use(props.params);
  const tool = ALL_TOOLS.find((t) => t.id === params.id);
  if (!tool) return notFound();

  let ToolComponent;

  // --- EXPLICIT ROUTING (No guessing) ---
  if (tool.id === 'case-convert') ToolComponent = <TextTransformer toolId={tool.id} title={tool.name} />;
  else if (tool.id === 'smart-budget') ToolComponent = <BudgetPlanner />;
  else if (tool.id === 'universal-converter' || tool.id === 'json-csv') ToolComponent = <UniversalConverter title={tool.name} subtitle={tool.desc} />;
  else if (tool.id === 'rent-receipt') ToolComponent = <RentReceiptGenerator />;
  else if (tool.id === 'salary-slip') ToolComponent = <SalarySlipGenerator />;
  else if (tool.id === 'invoice-generator') ToolComponent = <InvoiceGenerator />;
  else if (tool.id === 'id-card') ToolComponent = <IdCardMaker />;
  else if (tool.id === 'smart-agreement') ToolComponent = <AgreementBuilder />;
  
  else if (tool.id === 'smart-loan') ToolComponent = <InvestmentCalculator mode="loan" />;
  else if (tool.id === 'smart-sip') ToolComponent = <InvestmentCalculator mode="sip" />;
  else if (tool.id === 'smart-net-worth') ToolComponent = <InvestmentCalculator mode="net-worth" />;
  else if (tool.id === 'smart-retirement') ToolComponent = <InvestmentCalculator mode="retirement" />;
  
  else if (tool.id === 'unit-convert') ToolComponent = <UnitConverter />;
  else if (tool.id === 'smart-scan') ToolComponent = <SmartScan />;
  else if (tool.id === 'smart-pdf-merge') ToolComponent = <PdfWorkbench />;
  else if (tool.id === 'smart-img-compress') ToolComponent = <ImageCompressor />;
  else if (tool.id === 'smart-ocr') ToolComponent = <SmartOCR />;
  else if (tool.id === 'smart-img-convert') ToolComponent = <ImageConverter />;
  else if (tool.id === 'smart-pdf-split') ToolComponent = <PdfSplitter />;
  
  else if (['smart-url', 'smart-base64', 'smart-uuid', 'smart-html-entities'].includes(tool.id)) ToolComponent = <StringStudio toolId={tool.id} />;
  else if (tool.id.includes('json') || tool.id.includes('sql')) ToolComponent = <SmartEditor toolId={tool.id} />;
  
  else if (tool.id === 'life-os') ToolComponent = <LifeOS />;
  else if (tool.id === 'qr-code') ToolComponent = <QrGenerator />;
  else if (tool.id === 'smart-pass') ToolComponent = <PasswordGenerator />;
  else if (tool.id === 'pomodoro') ToolComponent = <Pomodoro />;
  
  else if (tool.id.includes('bmi') || tool.id.includes('breath') || tool.id.includes('workout')) ToolComponent = <HealthStation toolId={tool.id} />;
  else if (tool.id.includes('chat') || tool.id.includes('analyze')) ToolComponent = <AiStudio toolId={tool.id} />;
  
  else if (tool.id === 'color-picker') ToolComponent = <ColorStudio />;
  else if (tool.id === 'smart-diff') ToolComponent = <DiffStudio />;
  else if (tool.id === 'api-playground') ToolComponent = <ApiPlayground />;
  else if (tool.id === 'smart-jwt') ToolComponent = <JwtDebugger />;
  else if (tool.id === 'cron-gen') ToolComponent = <CronGenerator />;
  else if (tool.id === 'git-cheats') ToolComponent = <GitCheats />;
  
  // FALLBACK
  else ToolComponent = <TextEngine toolId={tool.id} title={tool.name} description={tool.desc} />;

  return <ToolShell tool={tool}>{ToolComponent}</ToolShell>;
}