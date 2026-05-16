"use client";

import { ThemeProvider } from '@/src/components/ThemeProvider';
import ErrorBoundary from '@/src/components/common/ErrorBoundary';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import ScrollToTop from '@/src/components/common/ScrollToTop';
import WhatsAppChat from '@/src/components/common/WhatsAppChat';
import BackToTop from '@/src/components/common/BackToTop';
import CookieConsent from '@/src/components/common/CookieConsent';
import Analytics from '@/src/components/common/Analytics';
import type { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ScrollToTop />
        <Header />
        <main className="flex-grow flex flex-col min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppChat />
        <BackToTop />
        <CookieConsent />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
