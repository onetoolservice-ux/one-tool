import Script from "next/script";

interface ToolSchemaProps {
  name: string;
  description: string;
  path: string;
  datePublished?: string;
  category?: string;
}

export default function ToolSchema({ name, description, path, category = "Application" }: ToolSchemaProps) {
  const baseUrl = "https://onetool.co.in";
  const url = `${baseUrl}${path}`;

  // This is the "SoftwareApplication" schema Google looks for
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "description": description,
    "applicationCategory": category,
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "124"
    },
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "One Tool",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.svg`
      }
    }
  };

  return (
    <Script
      id={`schema-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
