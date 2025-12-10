'use client';

import React from 'react';

// FIX: Added interface to accept 'gaId' prop
export const GoogleAnalytics = ({ gaId }: { gaId?: string }) => {
  // If no ID is provided, or during development, we render nothing
  if (!gaId) return null;

  return (
    <>
      {/* Placeholder for actual GA Script */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        }}
      />
    </>
  );
};
