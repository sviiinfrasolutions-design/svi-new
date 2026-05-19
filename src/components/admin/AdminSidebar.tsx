'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Calculator, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-white/90 dark:bg-[#0e0e14]/90 backdrop-blur-xl border-r border-gray-200 dark:border-brand-gold/15 flex flex-col relative z-40 transition-colors duration-300"
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-brand-gold text-brand-navy rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-50"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-3 overflow-hidden whitespace-nowrap h-20">
        <div className="w-8 h-8 rounded shrink-0 bg-brand-gold flex items-center justify-center text-brand-navy font-serif font-bold text-xl leading-none">
          S
        </div>
        <motion.div animate={{ opacity: collapsed ? 0 : 1 }} className="flex flex-col">
          <h1 className="text-lg font-bold font-serif text-brand-navy dark:text-white leading-tight">SVI Infra</h1>
          <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Admin Portal</p>
        </motion.div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1 custom-scrollbar">
        
        <Link 
          href="/admin/dashboard"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group overflow-hidden ${
            pathname === '/admin/dashboard' 
              ? 'bg-brand-gold/10 text-brand-gold' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
          title={collapsed ? "Dashboard" : ""}
        >
          <div className="relative flex items-center justify-center shrink-0">
            {pathname === '/admin/dashboard' && (
              <motion.div layoutId="active-nav" className="absolute -left-3 w-1 h-8 bg-brand-gold rounded-r-full" />
            )}
            <LayoutDashboard className={`w-5 h-5 ${pathname === '/admin/dashboard' ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`} />
          </div>
          <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>Dashboard</span>
        </Link>

        <motion.div animate={{ opacity: collapsed ? 0 : 1 }} className="mt-6 mb-2 px-4 text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap overflow-hidden">
          Documents
        </motion.div>

        {documentItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group overflow-hidden ${
                isActive 
                  ? 'bg-brand-gold/10 text-brand-gold' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              title={collapsed ? item.name : ""}
            >
              <div className="relative flex items-center justify-center shrink-0">
                {isActive && (
                  <motion.div layoutId="active-nav" className="absolute -left-3 w-1 h-8 bg-brand-gold rounded-r-full" />
                )}
                <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`} />
              </div>
              <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-brand-gold/15">
        <Link 
          href="/admin/settings"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group overflow-hidden ${
            pathname.startsWith('/admin/settings') 
              ? 'bg-brand-gold/10 text-brand-gold' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
          title={collapsed ? "Settings" : ""}
        >
          <div className="relative flex items-center justify-center shrink-0">
             {pathname.startsWith('/admin/settings') && (
                <motion.div layoutId="active-nav" className="absolute -left-3 w-1 h-8 bg-brand-gold rounded-r-full" />
             )}
            <Settings className={`w-5 h-5 ${pathname.startsWith('/admin/settings') ? 'text-brand-gold' : 'group-hover:text-brand-gold transition-colors'}`} />
          </div>
          <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group overflow-hidden cursor-pointer"
          title={collapsed ? "Logout" : ""}
        >
          <div className="flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;