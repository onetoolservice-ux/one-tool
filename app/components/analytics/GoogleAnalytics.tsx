"use client";
import Script from "next/script";

export const GoogleAnalytics = () => {
  return (
    <>
      <Script
        strategy="lazyOnload" 
        src="https://www.googletagmanager.com/gtag/js?id=G-G250LVCNPK"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-G250LVCNPK', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
};