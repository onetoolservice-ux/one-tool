import React from 'react';
import type { Tool } from '@/app/lib/utils/tools-fallback';
import { generateKeywords, generateContentKeywords } from '@/app/lib/seo/metadata-generator';

interface ToolSEOUIProps {
  tool: Tool;
}

export function ToolSEOUI({ tool }: ToolSEOUIProps) {
  const keywords = generateKeywords(tool);
  const contentKeywords = generateContentKeywords(tool);
  const categoryLabel = tool.category.replace(/-/g, ' ');
  const description =
    tool.description ||
    `Use ${tool.name} free online. No signup required. Works entirely in your browser.`;

  // Curated tool/category phrases (not the full long-tail set) for visible/crawlable copy
  const featureKws = contentKeywords.slice(0, 5);

  return (
    // Visually hidden — accessible to screen readers and search engines, no UI impact
    <div className="sr-only">
      <h1>{tool.name} — Free Online Tool</h1>
      <p>{description}</p>

      <p>
        {tool.name} is a free online tool in the {categoryLabel} category. Use it directly in
        your browser — no signup, no download, no account required. Works on desktop, mobile,
        and tablet.
      </p>

      {featureKws.length > 0 && (
        <section>
          <h2>What you can do with {tool.name}</h2>
          <ul>
            {featureKws.map((kw) => (
              <li key={kw}>{kw}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>About {tool.name}</h2>
        <p>
          {tool.name} is part of OneTool — a collection of 70+ free browser-based tools for
          personal finance and small business, covering bank statements, budgeting, GST,
          invoicing, and tax. All tools are completely free, require no signup, and store data
          locally in your browser.
        </p>
        <p>
          Popular searches that lead to this tool:{' '}
          {keywords.slice(0, 8).join(', ')}.
        </p>
      </section>
    </div>
  );
}
