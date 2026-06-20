'use client';

import { useLocale, useTranslations } from 'next-intl';
import FAQSection from '@/src/components/faq/FAQSection';
import { BUYING_PROCESS_FAQS, LEGAL_FAQS } from '@/src/data/faq/general';
import { BUYING_PROCESS_FAQS_HI, LEGAL_FAQS_HI } from '@/src/data/faq/hi';

export default function ContactFAQ() {
  const locale = useLocale();
  const t = useTranslations('pages.contactFAQ');

  const faqs =
    locale === 'hi'
      ? [...BUYING_PROCESS_FAQS_HI.slice(0, 4), ...LEGAL_FAQS_HI.slice(0, 2)]
      : [...BUYING_PROCESS_FAQS.slice(0, 4), ...LEGAL_FAQS.slice(0, 2)];

  return (
    <FAQSection
      items={faqs}
      title={t('title')}
      subtitle={t('subtitle')}
      variant="light"
      maxWidth="max-w-3xl"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
