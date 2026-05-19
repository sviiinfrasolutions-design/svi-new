'use client';

import { useEffect, useState } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { Sun, Moon } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminHeader from '@/src/components/admin/AdminHeader';
import AdminSidebar from '@/src/components/admin/AdminSidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('svi-theme-v1');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (stored !== 'light' && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('svi-theme-v1', next ? 'dark' : 'light');
  };

  return (
    <div
      className={`${inter.variable} ${playfair.variable} font-sans bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-white min-h-screen w-full flex`}
      style={{ visibility: mounted ? 'visible' : 'hidden' }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col relative w-full overflow-x-hidden h-screen">
        <AdminHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
