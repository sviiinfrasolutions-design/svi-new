'use client';

import { useLocale, useTranslations } from 'next-intl';
import FAQSection from '@/src/components/faq/FAQSection';
import { INVESTMENT_FAQS, LEGAL_FAQS } from '@/src/data/faq/general';
import { INVESTMENT_FAQS_HI, LEGAL_FAQS_HI } from '@/src/data/faq/hi';

export default function AboutFAQ() {
  const locale = useLocale();
  const t = useTranslations('pages.about');

  const faqs =
    locale === 'hi'
      ? [...INVESTMENT_FAQS_HI, ...LEGAL_FAQS_HI]
      : [...INVESTMENT_FAQS, ...LEGAL_FAQS];

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
