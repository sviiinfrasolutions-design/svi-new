'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { CheckCircle, Home } from 'lucide-react';

const GRADIENT_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(45deg, #1a2744 0, #1a2744 1px, transparent 0, transparent 50%)',
  backgroundSize: '40px 40px',
};

export default function ThankYou() {
  return (
    <div className="bg-brand-bg relative flex min-h-screen items-center justify-center py-20 pt-24 dark:bg-gray-900">
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full opacity-5"
        style={GRADIENT_STYLE}
      ></div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mx-auto max-w-2xl border border-gray-200 bg-white p-16 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="border-brand-gold text-brand-gold mx-auto mb-10 flex h-24 w-24 items-center justify-center border shadow-sm"
          >
            <CheckCircle size={40} />
          </motion.div>

          <h4 className="mb-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase dark:text-gray-500">
            Submission Complete
          </h4>
          <h1 className="text-brand-navy mb-6 font-serif text-4xl md:text-5xl dark:text-gray-100">
            Thank You!
          </h1>
          <p className="mb-12 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Your registration has been successfully submitted. One of our property experts will
            reach out to you shortly.
          </p>

          <Link
            href="/"
            className="bg-brand-navy hover:bg-brand-gold text-brand-gold hover:text-brand-navy border-brand-navy flex inline-flex w-full items-center justify-center gap-3 border px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors sm:w-auto"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
