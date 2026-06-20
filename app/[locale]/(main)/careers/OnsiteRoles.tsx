'use client';

import { motion } from 'motion/react';
import { Briefcase, CheckCircle, Users, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function OnsiteRoles() {
  const t = useTranslations('pages.careers');

  const ROLES = [
    {
      icon: <Briefcase size={28} />,
      role: t('jobs.bdm'),
      type: t('onsite'),
      salary: t('upTo', { amount: '40k' }),
    },
    {
      icon: <Users size={28} />,
      role: t('jobs.bde'),
      type: t('onsite'),
      salary: t('upTo', { amount: '30k' }),
    },
    {
      icon: <Target size={28} />,
      role: t('jobs.tl'),
      type: t('onsite'),
      salary: t('upTo', { amount: '60k' }),
    },
  ];
  return (
    <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {ROLES.map((job, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="hover:border-brand-gold dark:hover:border-brand-gold group border border-gray-100 bg-white p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 sm:p-10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-none"
        >
          <div className="text-brand-navy group-hover:text-brand-gold dark:group-hover:text-brand-gold group-hover:border-brand-gold mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {job.icon}
          </div>
          <h3 className="text-brand-navy mb-4 font-serif text-xl dark:text-gray-100">{job.role}</h3>
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CheckCircle size={14} className="text-brand-gold" />
            <span>{job.type}</span>
          </div>
          <div className="bg-brand-bg text-brand-gold inline-block rounded-sm px-4 py-2 text-lg font-bold dark:bg-gray-800">
            {job.salary}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
