'use client';

import { useLocale, useTranslations } from 'next-intl';
import FAQSection from '@/src/components/faq/FAQSection';
import { BUYING_PROCESS_FAQS } from '@/src/data/faq/general';
import { BUYING_PROCESS_FAQS_HI } from '@/src/data/faq/hi';

export default function RegistrationFAQ() {
  const locale = useLocale();
  const t = useTranslations('pages.registration');

  const faqs = locale === 'hi' ? BUYING_PROCESS_FAQS_HI : BUYING_PROCESS_FAQS;

  return (
    <FAQSection
      items={faqs}
      title={t('faqTitle')}
      subtitle={t('faqSubtitle')}
      variant="none"
      maxWidth="max-w-4xl"
      hideCTA={true}
      defaultActiveIndex={-1}
    />
  );
}
