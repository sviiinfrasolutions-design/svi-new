'use client';

import { Phone, Calendar, FileText } from 'lucide-react';
import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { PHONE_HREF } from '@/src/lib/constants';

function QuickActions() {
  const t = useTranslations('quickActions');
  const QUICK_ACTIONS = [
    {
      label: t('scheduleVisit'),
      icon: Calendar,
      href: '/contact?subject=Site%20Visit',
      className:
        'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold',
    },
    {
      label: t('callBack'),
      icon: Phone,
      href: PHONE_HREF,
      className:
        'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold',
    },
    {
      label: t('getBrochure'),
      icon: FileText,
      href: '/contact?subject=Brochure%20Request',
      className:
        'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-brand-gold/10 dark:hover:text-brand-gold',
    },
  ];
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <a
            key={action.label}
            href={action.href}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${action.className}`}
          >
            <Icon className="h-3 w-3" />
            {action.label}
          </a>
        );
      })}
    </div>
  );
}

export default memo(QuickActions);
