'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';

interface AdminHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  adminName?: string;
}

export default function AdminHeader({ isDark, toggleTheme, adminName = 'Admin' }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Format pathname for breadcrumb (e.g., /admin/payment-receipt -> Payment Receipt)
  const pathParts = pathname.split('/').filter(Boolean);
  let breadcrumb = 'Dashboard';
  if (pathParts.length > 1) {
    const lastPart = pathParts[pathParts.length - 1];
    breadcrumb = lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/admin');
  };

  return (
    <header className="relative z-30 border-b border-gray-200 dark:border-brand-gold/15 bg-white/80 dark:bg-[#0d0d14]/75 backdrop-blur-xl sticky top-0 transition-colors duration-300">
      <div className="px-6 h-16 flex items-center justify-between">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <span className="hover:text-brand-gold cursor-pointer transition-colors hidden sm:inline">Admin</span>
          <span className="hidden sm:inline">/</span>
          <span className="text-gray-900 dark:text-white font-bold tracking-wide">{breadcrumb}</span>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          
          <div className="relative hidden md:block max-w-xs w-full mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Quick search... (Ctrl+K)" 
              className="w-full bg-gray-100 dark:bg-[#111118] border border-transparent dark:border-white/5 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 transition-all"
            />
          </div>

          <button className="relative p-2 text-gray-500 hover:text-brand-gold transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0d0d14]"></span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-gray-500 hover:text-brand-gold transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>
          
          <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold font-bold text-xs uppercase group-hover:bg-brand-gold/30 transition-colors">
              {adminName.substring(0, 2)}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hidden sm:block group-hover:text-brand-gold transition-colors">{adminName}</span>
          </div>
          
        </div>
      </div>
    </header>
  );
}