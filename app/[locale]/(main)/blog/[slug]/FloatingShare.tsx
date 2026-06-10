'use client';

import { useEffect, useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

interface FloatingShareProps {
  title: string;
}

export default function FloatingShare({ title }: FloatingShareProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero section
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 flex-col gap-2 xl:flex">
      <button
        onClick={handleShare}
        className="group hover:border-brand-gold hover:text-brand-gold dark:hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/60 bg-white text-gray-500 shadow-md transition-all hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900 dark:text-gray-400"
        title="Share"
      >
        <Share2 size={16} />
      </button>
      <button
        onClick={handleCopy}
        className={`group flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition-all ${
          copied
            ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'hover:border-brand-gold hover:text-brand-gold dark:hover:text-brand-gold border-gray-200/60 bg-white text-gray-500 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-900 dark:text-gray-400'
        }`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </button>
    </div>
  );
}
