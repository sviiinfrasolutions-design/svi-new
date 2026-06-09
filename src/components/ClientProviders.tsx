'use client';

import Analytics from '@/src/components/common/Analytics';
import BackToTop from '@/src/components/common/BackToTop';
import CookieConsent from '@/src/components/common/CookieConsent';
import ErrorBoundary from '@/src/components/common/ErrorBoundary';
import Footer from '@/src/components/Footer';
import Header from '@/src/components/Header';
import type { ReactNode } from 'react';
import ScrollToTop from '@/src/components/common/ScrollToTop';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import ChatBot from '@/src/components/home/ChatBot';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ScrollToTop />
        <Header />
        <main className="flex min-h-screen flex-grow flex-col">{children}</main>
        <Footer />
        <ChatBot />
        <BackToTop />
        <CookieConsent />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
