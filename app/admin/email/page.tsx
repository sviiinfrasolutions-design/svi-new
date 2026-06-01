'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, PenLine, Inbox, Megaphone, FileText, Globe, Settings } from 'lucide-react';
import { supabase } from '@/src/lib/supabase/client';

import { Tab, ForwardData, ReplyData } from '@/src/components/admin/email/types';
import { ComposeTab } from '@/src/components/admin/email/ComposeTab';
import { SentTab } from '@/src/components/admin/email/SentTab';
import { TemplatesTab } from '@/src/components/admin/email/TemplatesTab';
import { DomainsTab } from '@/src/components/admin/email/DomainsTab';
import { SettingsTab } from '@/src/components/admin/email/SettingsTab';
import { CampaignsTab } from '@/src/components/admin/email/CampaignsTab';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'compose', label: 'Compose', icon: PenLine },
  { id: 'sent', label: 'Sent', icon: Inbox },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'domains', label: 'Domains', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminEmailPage() {
  const [activeTab, setActiveTab] = useState<Tab>('compose');
  const [adminEmail, setAdminEmail] = useState('');
  const [forwardData, setForwardData] = useState<ForwardData | null>(null);
  const [replyData, setReplyData] = useState<ReplyData | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setAdminEmail(data.user.email);
    });
  }, []);

  const handleForward = (data: ForwardData) => {
    setForwardData(data);
    setReplyData(null);
    setActiveTab('compose');
  };

  const handleReply = (data: ReplyData) => {
    setReplyData(data);
    setForwardData(null);
    setActiveTab('compose');
  };

  const clearPrefill = () => {
    setForwardData(null);
    setReplyData(null);
  };

  return (
    <div className="min-h-screen">
      {/* ─── Page Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Gold accent line */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="from-brand-gold to-brand-gold/30 h-10 w-[3px] rounded-full bg-gradient-to-b" />
            </div>
            <div>
              <h1 className="font-serif text-[2rem] leading-tight tracking-tight text-gray-900 md:text-[2.5rem] dark:text-white">
                <span>Email</span>
                <span className="text-gradient-gold ml-2">Center</span>
              </h1>
              <p className="mt-1 font-mono text-[11px] tracking-wider text-gray-400 uppercase dark:text-gray-500">
                {process.env.NODE_ENV === 'development' &&
                process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false'
                  ? 'resend · compose · send · track'
                  : 'compose · manage · track · deliver'}
              </p>
            </div>
          </div>

          {/* Resend badge — dev only */}
          {process.env.NODE_ENV === 'development' &&
            process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false' && (
              <a
                href="https://resend.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:border-brand-gold/30 hover:bg-brand-gold/5 dark:hover:border-brand-gold/20 flex items-center gap-2.5 rounded-lg border border-gray-200/60 bg-white/50 px-3.5 py-2 backdrop-blur-sm transition-all dark:border-gray-700/60 dark:bg-white/[0.02]"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-gray-900 dark:bg-white">
                  <Mail className="h-2.5 w-2.5 text-white dark:text-gray-900" />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Powered by
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">Resend</span>
              </a>
            )}
        </div>
      </motion.div>

      {/* ─── Tab Navigation ─── */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-0.5 overflow-x-auto" role="tablist">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-brand-gold'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-all ${isActive ? 'text-brand-gold' : 'text-gray-400 dark:text-gray-600'}`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="emailTabIndicator"
                    className="bg-brand-gold absolute right-0 bottom-0 left-0 h-[2px] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'compose' && (
            <ComposeTab
              adminEmail={adminEmail}
              forwardData={forwardData}
              replyData={replyData}
              onClearPrefill={clearPrefill}
            />
          )}
          {activeTab === 'sent' && <SentTab onForward={handleForward} onReply={handleReply} />}
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'templates' && <TemplatesTab />}
          {activeTab === 'domains' && <DomainsTab />}
          {activeTab === 'settings' && <SettingsTab adminEmail={adminEmail} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
