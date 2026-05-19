'use client';

import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { motion } from 'motion/react';
import { supabase } from '@/src/lib/supabase/client';
import { useState } from 'react';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const documentItems = [
    { name: 'Allotment Letter', path: '/admin/allotment-letter', icon: FileText },
    { name: 'Payment Receipt', path: '/admin/payment-receipt', icon: Receipt },
    { name: 'Payment Plan', path: '/admin/payment-plan', icon: Calculator },
    { name: 'Offer Letter', path: '/admin/offer-letter', icon: FileText },
    { name: 'BBA', path: '/admin/bba', icon: FileText },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="dark:border-brand-gold/15 relative z-40 flex h-screen flex-col border-r border-gray-200 bg-white/90 backdrop-blur-xl transition-colors duration-300 dark:bg-[#0e0e14]/90"
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bg-brand-gold text-brand-navy absolute top-6 -right-3 z-50 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="flex h-20 items-center gap-3 overflow-hidden border-b border-gray-100 p-6 whitespace-nowrap dark:border-white/5">
        <div className="bg-brand-gold text-brand-navy flex h-8 w-8 shrink-0 items-center justify-center rounded font-serif text-xl leading-none font-bold">
          S
        </div>
        <motion.div animate={{ opacity: collapsed ? 0 : 1 }} className="flex flex-col">
          <h1 className="text-brand-navy font-serif text-lg leading-tight font-bold dark:text-white">
            SVI Infra
          </h1>
          <p className="text-brand-gold text-[10px] font-bold tracking-widest uppercase">
            Admin Portal
          </p>
        </motion.div>
      </div>

      <div className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6">
        <Link
          href="/admin/dashboard"
          className={`group flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-all ${
            pathname === '/admin/dashboard'
              ? 'bg-brand-gold/10 text-brand-gold'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
          }`}
          title={collapsed ? 'Dashboard' : ''}
        >
          <div className="relative flex shrink-0 items-center justify-center">
            {pathname === '/admin/dashboard' && (
              <motion.div
                layoutId="active-nav"
                className="bg-brand-gold absolute -left-3 h-8 w-1 rounded-r-full"
              />
            )}
            <LayoutDashboard
              className={`h-5 w-5 ${pathname === '/admin/dashboard' ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
            />
          </div>
          <span
            className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
          >
            Dashboard
          </span>
        </Link>

        <motion.div
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="mt-6 mb-2 overflow-hidden px-4 text-[10px] font-bold tracking-[0.15em] whitespace-nowrap text-gray-400 uppercase dark:text-gray-500"
        >
          Documents
        </motion.div>

        {documentItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`group flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-all ${
                isActive
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
              }`}
              title={collapsed ? item.name : ''}
            >
              <div className="relative flex shrink-0 items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="bg-brand-gold absolute -left-3 h-8 w-1 rounded-r-full"
                  />
                )}
                <item.icon
                  className={`h-4.5 w-4.5 ${isActive ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
                />
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="dark:border-brand-gold/15 border-t border-gray-200 p-3">
        <Link
          href="/admin/settings"
          className={`group flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-all ${
            pathname.startsWith('/admin/settings')
              ? 'bg-brand-gold/10 text-brand-gold'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
          }`}
          title={collapsed ? 'Settings' : ''}
        >
          <div className="relative flex shrink-0 items-center justify-center">
            {pathname.startsWith('/admin/settings') && (
              <motion.div
                layoutId="active-nav"
                className="bg-brand-gold absolute -left-3 h-8 w-1 rounded-r-full"
              />
            )}
            <Settings
              className={`h-5 w-5 ${pathname.startsWith('/admin/settings') ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`}
            />
          </div>
          <span
            className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
          >
            Settings
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="group mt-1 flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
          title={collapsed ? 'Logout' : ''}
        >
          <div className="flex shrink-0 items-center justify-center">
            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          <span
            className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
          >
            Logout
          </span>
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
