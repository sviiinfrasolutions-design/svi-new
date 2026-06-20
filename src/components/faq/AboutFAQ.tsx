'use client';

import FAQSection from '@/src/components/faq/FAQSection';
import { INVESTMENT_FAQS, LEGAL_FAQS } from '@/src/data/faq/general';
import { useTranslations } from 'next-intl';

const ABOUT_FAQS = [...INVESTMENT_FAQS, ...LEGAL_FAQS];

export default function AboutFAQ() {
  const t = useTranslations('pages.about');

  return (
    <FAQSection
      items={ABOUT_FAQS}
      title={t('faqTitle')}
      subtitle={t('faqSubtitle')}
      variant="light"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
