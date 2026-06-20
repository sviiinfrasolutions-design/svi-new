'use client';

import { useLocale, useTranslations } from 'next-intl';
import FAQSection from '@/src/components/faq/FAQSection';
import { PROJECT_FAQS } from '@/src/data/faq/general';
import { PROJECT_FAQS_HI } from '@/src/data/faq/hi';

export default function ProjectsFAQ() {
  const locale = useLocale();
  const t = useTranslations('pages.projects');

  const faqs = locale === 'hi' ? PROJECT_FAQS_HI : PROJECT_FAQS;

  return (
    <FAQSection
      items={faqs}
      title={t('faqTitle')}
      subtitle={t('faqSubtitle')}
      variant="light"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
