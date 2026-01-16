"use client";
import React, { Suspense, lazy } from 'react';
import Head from 'next/head';

// Lazy load the dashboard layout for better performance
const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout').then(module => ({ default: module.default })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Preload critical images
const preloadImages = () => {
  return new Promise<void>((resolve) => {
    const images = ['/Logo-Dark.png', '/Logo-Light.png'];
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        resolve();
      }
    };

    images.forEach(src => {
      const img = new window.Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
      img.src = src;
    });
  });
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Preload images on mount
  React.useEffect(() => {
    preloadImages();
  }, []);

  return (
    <>
      <Head>
        <title>Nyantra Dashboard - Direct Benefit Transfer Management</title>
        <meta name="description" content="Comprehensive dashboard for managing Direct Benefit Transfer operations under PCR & PoA Acts. Monitor applications, beneficiaries, disbursements, and analytics in real-time." />
        <meta name="keywords" content="DBT, Direct Benefit Transfer, PCR Act, PoA Act, social justice, government dashboard, beneficiary management" />
        <meta name="robots" content="noindex, nofollow" /> {/* Dashboard pages should not be indexed */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Nyantra Dashboard - Direct Benefit Transfer Management" />
        <meta property="og:description" content="Comprehensive dashboard for managing Direct Benefit Transfer operations under PCR & PoA Acts." />
        <meta property="og:image" content="/og-dashboard.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Nyantra Dashboard - Direct Benefit Transfer Management" />
        <meta property="twitter:description" content="Comprehensive dashboard for managing Direct Benefit Transfer operations under PCR & PoA Acts." />
        <meta property="twitter:image" content="/og-dashboard.png" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        {/* Preload critical resources */}
        <link rel="preload" href="/Logo-Dark.png" as="image" />
        <link rel="preload" href="/Logo-Light.png" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Nyantra Dashboard",
              "description": "Comprehensive dashboard for managing Direct Benefit Transfer operations under PCR & PoA Acts",
              "applicationCategory": "GovernmentApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "category": "Government Services"
              },
              "creator": {
                "@type": "Organization",
                "name": "Nyantra"
              }
            })
          }}
        />
      </Head>

      <Suspense fallback={<LoadingFallback />}>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </Suspense>
    </>
  );
}