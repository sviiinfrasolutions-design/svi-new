'use client';

import FAQSection from '@/src/components/faq/FAQSection';
import { BUYING_PROCESS_FAQS, LEGAL_FAQS } from '@/src/data/faq/general';
import { useTranslations } from 'next-intl';

const CONTACT_FAQS = [...BUYING_PROCESS_FAQS.slice(0, 4), ...LEGAL_FAQS.slice(0, 2)];

export default function ContactFAQ() {
  const t = useTranslations('pages.contactFAQ');
  return (
    <FAQSection
      items={CONTACT_FAQS}
      title={t('title')}
      subtitle={t('subtitle')}
      variant="light"
      maxWidth="max-w-3xl"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
