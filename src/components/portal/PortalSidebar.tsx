'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';
import { motion } from 'motion/react';
import { LayoutDashboard, Building2, FileText, CreditCard, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/src/stores/authStore';

const navItems = [
  { href: '/portal', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/portal/properties', icon: Building2, label: 'My Properties' },
  { href: '/portal/documents', icon: FileText, label: 'Documents' },
  { href: '/portal/payments', icon: CreditCard, label: 'Payments' },
];

export function PortalSidebar() {
  const t = useTranslations('Portal');
  const pathname = usePathname();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-200/50 bg-white/50 pt-20 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/50">
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                isActive
                  ? 'text-[#0256B4] dark:text-[#E8D17A]'
                  : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="portal-sidebar-active"
                  className="absolute inset-0 rounded-xl bg-[#0256B4]/10 dark:bg-[#E8D17A]/10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-gray-200/50 p-4 dark:border-gray-800/50">
        <Link
          href="/portal/settings"
          className={`group relative flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-300 ${
            pathname === '/portal/settings'
              ? 'text-[#0256B4] dark:text-[#E8D17A]'
              : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white'
          }`}
        >
          {pathname === '/portal/settings' && (
            <motion.div
              layoutId="portal-sidebar-active"
              className="absolute inset-0 rounded-xl bg-[#0256B4]/10 dark:bg-[#E8D17A]/10"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <Settings className="relative z-10 h-5 w-5" />
          <span className="relative z-10 font-medium">Settings</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-red-600 transition-all duration-300 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
