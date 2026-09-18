import { ImageResponse } from 'next/og';
import { OGImageTemplate } from '@/app/lib/seo/og-image-template';

export const runtime = 'edge';
export const alt = 'OneTool — Free Online Tools for Finance & Business';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <OGImageTemplate
        eyebrow="Finance & Business"
        title="Free Online Tools for Finance & Business"
        subtitle="Bank statements, GST, invoices, budgets, tax & more — no signup, works in your browser."
      />
    ),
    { ...size }
  );
}
