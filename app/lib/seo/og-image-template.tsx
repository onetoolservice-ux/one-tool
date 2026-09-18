// Shared visual template for all dynamically-generated Open Graph images
// (used by opengraph-image.tsx route files, rendered via next/og's ImageResponse/satori —
// every element with children needs an explicit `display: flex`, satori doesn't do block layout)

export function OGImageTemplate({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#0F111A',
        backgroundImage: 'linear-gradient(135deg, #0F111A 0%, #171A2B 100%)',
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 700,
            color: '#fff',
            marginRight: 20,
          }}
        >
          OT
        </div>
        <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: '#9CA3AF', letterSpacing: 1 }}>
          OneTool · {eyebrow}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: title.length > 28 ? 58 : 72,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.1,
          maxWidth: 1020,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', fontSize: 30, color: '#9CA3AF', marginTop: 28, maxWidth: 940, lineHeight: 1.4 }}>
        {subtitle}
      </div>
    </div>
  );
}
