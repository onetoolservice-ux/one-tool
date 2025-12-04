"use client";
import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { ToolShell } from '@/app/components/tools/tool-shell';

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

// ... (Include other imports if needed, but for MVP these are the critical ones) ...
// Assuming other hero imports are available or will fallback safely.

export default function ToolPage(props: { params: Promise<{ category: string; id: string }> }) {
  const params = use(props.params);
  const tool = ALL_TOOLS.find((t) => t.id === params.id);
  
  if (!tool) return notFound();

  let ToolComponent;

  // PRIORITY MAPPING
  if (tool.id === 'universal-converter') ToolComponent = <UniversalConverter />;
  else if (tool.id === 'json-csv') ToolComponent = <UniversalConverter defaultCategory="Code" />;
  else if (tool.id === 'smart-budget') ToolComponent = <BudgetPlanner />;
  else if (tool.id === 'unit-convert') ToolComponent = <UnitConverter />;
  else if (tool.id === 'case-convert') ToolComponent = <TextTransformer toolId={tool.id} title={tool.name} />;
  else if (tool.id === 'smart-json' || tool.id === 'smart-sql') ToolComponent = <SmartEditor toolId={tool.id} />;
  
  // FALLBACKS
  else if (tool.category === 'Documents') ToolComponent = <FileEngine toolId={tool.id} title={tool.name} />;
  else if (tool.category === 'Converters') ToolComponent = <MathEngine toolId={tool.id} />;
  else ToolComponent = <TextEngine toolId={tool.id} title={tool.name} description={tool.desc} />;

  return <ToolShell tool={tool}>{ToolComponent}</ToolShell>;
}
