'use client';

import React from 'react';
import Script from 'next/script';

export const GoogleAnalytics = ({ gaId }: { gaId?: string }) => {
  // Only load GA if explicitly enabled via environment variable to avoid third-party cookies
  // Set NEXT_PUBLIC_ENABLE_ANALYTICS=true to enable
  if (!gaId || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            cookie_flags: 'SameSite=None;Secure',
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
          });
        `}
      </Script>
    </>
  );
};
