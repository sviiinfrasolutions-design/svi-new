'use client';

import Script from 'next/script';

export default function Analytics() {
  const trackingId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!trackingId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `}
      </Script>
    </>
  );
}
