'use client';

import { motion } from 'motion/react';
import { DollarSign, Laptop, Star } from 'lucide-react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FreelancePerks() {
  const t = useTranslations('pages.careers');

  const PERKS = [
    { icon: <Laptop size={28} />, title: t('perkRemote'), desc: t('perkRemoteDesc') },
    { icon: <DollarSign size={28} />, title: t('perkCommission'), desc: t('perkCommissionDesc') },
    { icon: <Star size={28} />, title: t('perkSupport'), desc: t('perkSupportDesc') },
  ];

  const GRADIENT_STYLE = {
    backgroundImage:
      'repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)',
    backgroundSize: '40px 40px',
  };

  return (
    <section className="bg-brand-navy relative py-14 text-white md:py-24 dark:bg-gray-900">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-10"
        style={GRADIENT_STYLE}
      ></div>
      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h4 className="text-brand-gold mb-6 text-[10px] font-bold tracking-[0.3em] uppercase">
            {t('heading')}
          </h4>
          <h2 className="mb-8 font-serif text-4xl text-white">{t('freelanceHeading')}</h2>
          <div className="space-y-6 text-lg leading-relaxed text-gray-300">
            <p>{t('freelanceDescription')}</p>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {PERKS.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px', amount: 0.05 }}
              transition={{ delay: idx * 0.08 }}
              className="hover:border-brand-gold dark:hover:border-brand-gold border border-white/10 bg-white/5 p-6 text-center transition-colors sm:p-8 md:p-10 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="bg-brand-gold/10 text-brand-gold mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full">
                {val.icon}
              </div>
              <h3 className="mb-4 font-serif text-xl text-white dark:text-gray-100">{val.title}</h3>
              <p className="text-sm leading-relaxed text-gray-300 dark:text-gray-400">{val.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/contact"
            className="bg-brand-gold text-brand-navy inline-flex items-center gap-2 px-8 py-4 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-white"
          >
            {t('applyNow')} <Send size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
