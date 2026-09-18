import { ImageResponse } from 'next/og';
import { getToolById } from '@/app/lib/utils/tools-fallback';
import { OGImageTemplate } from '@/app/lib/seo/og-image-template';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawTool = getToolById(id);
  // Same category check as the actual page route (WorkspaceToolPage) — a tool
  // from the wrong workspace should fall back to the generic image, not render
  // a mislabeled "My Finance" image for a URL that 404s.
  const tool = rawTool && rawTool.category === 'My Finance' ? rawTool : null;
  const title = tool?.name || 'OneTool';
  const subtitle = tool
    ? (tool.description || `Use ${tool.name} free online.`).split(/(?<=\.)\s/)[0]
    : 'Free online tools for personal finance.';

  return new ImageResponse(
    <OGImageTemplate eyebrow="My Finance" title={title} subtitle={subtitle} />,
    { ...size }
  );
}
