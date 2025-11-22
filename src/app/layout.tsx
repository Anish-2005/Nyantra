"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientCursor from "../components/ClientCursor";
import ClientBackgroundCursor from "../components/ClientBackgroundCursor";
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
        <title>Nyantra - DBT Portal for Social Justice</title>
        <meta name="description" content="Empowering Justice Through Technology" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
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

        {children}

  {/* Foreground pointer cursor */}
  <ClientCursor />
  </LocaleProvider>
  </AuthProvider>
  </ThemeProvider>
      </body>
    </html>
  );
}
