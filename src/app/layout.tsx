"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientCursor from "../components/ClientCursor";
import ClientBackgroundCursor from "../components/ClientBackgroundCursor";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { LocaleProvider } from '../context/LocaleContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <head>
        <title>Nyantra - DBT Portal for Social Justice | Empowering Justice Through Technology</title>
        <meta name="description" content="Nyantra is a revolutionary DBT portal that streamlines government benefit disbursements, ensuring transparency, efficiency, and accessibility for millions of beneficiaries across India." />
        <meta name="keywords" content="DBT, Direct Benefit Transfer, government benefits, social justice, welfare schemes, India, digital transformation, beneficiary portal" />
        <meta name="author" content="Nyantra" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#14b8a6" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nyantra.vercel.app/" />
        <meta property="og:title" content="Nyantra - DBT Portal for Social Justice" />
        <meta property="og:description" content="Empowering Justice Through Technology - Streamlining government benefit disbursements with transparency and efficiency." />
        <meta property="og:image" content="https://nyantra.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://nyantra.vercel.app/" />
        <meta property="twitter:title" content="Nyantra - DBT Portal for Social Justice" />
        <meta property="twitter:description" content="Empowering Justice Through Technology - Streamlining government benefit disbursements with transparency and efficiency." />
        <meta property="twitter:image" content="https://nyantra.vercel.app/og-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://nyantra.vercel.app/" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Cloudinary widget */}
        <script src="https://upload-widget.cloudinary.com/global/all.js" async></script>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Nyantra",
              "description": "DBT Portal for Social Justice - Empowering Justice Through Technology",
              "url": "https://nyantra.vercel.app",
              "logo": "https://nyantra.vercel.app/Logo-Light.png",
              "sameAs": [
                "https://github.com/nyantra",
                "https://linkedin.com/company/nyantra"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["Hindi", "English"]
              },
              "applicationCategory": "Government Application",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "category": "Government Service"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
  <ThemeProvider>
  <AuthProvider>
  <LocaleProvider>
        {/* Background cursor layer (above background canvases/orbs, below content) */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
          <ClientBackgroundCursor />
        </div>

        <ErrorBoundary>
          {children}
        </ErrorBoundary>

  {/* Foreground pointer cursor */}
  <ClientCursor />
  </LocaleProvider>
  </AuthProvider>
  </ThemeProvider>
      </body>
    </html>
  );
}
