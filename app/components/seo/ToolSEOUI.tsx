import React from 'react';
import type { Tool } from '@/app/lib/utils/tools-fallback';
import { generateKeywords } from '@/app/lib/seo/metadata-generator';

interface ToolSEOUIProps {
  tool: Tool;
}

export function ToolSEOUI({ tool }: ToolSEOUIProps) {
  const keywords = generateKeywords(tool);
  const categoryLabel = tool.category.replace(/-/g, ' ');
  const description =
    tool.description ||
    `Use ${tool.name} free online. No signup required. Works entirely in your browser.`;

  // Pick the first 5 tool-specific keywords (after the generic base ones) for content
  const featureKws = keywords.slice(12, 17);

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
          {tool.name} is part of OneTool — a collection of 60+ free browser-based tools for
          finance, productivity, developer utilities, PDF tools, and more. All tools are
          completely free, require no signup, and store data locally in your browser.
        </p>
        <p>
          Popular searches that lead to this tool:{' '}
          {keywords.slice(0, 8).join(', ')}.
        </p>
      </section>
    </div>
  );
}
