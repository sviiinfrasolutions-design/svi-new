'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLotteryVisibility } from '@/src/lib/hooks/useLotteryVisibility';
import dynamic from 'next/dynamic';

const LotteryDrawSection = dynamic(() => import('@/src/components/lottery/LotteryDrawSection'), {
  ssr: false,
});

export default function LotteryClientSection() {
  const router = useRouter();
  const { visible, loading } = useLotteryVisibility();

  useEffect(() => {
    if (!loading && !visible) {
      router.replace('/');
    }
  }, [visible, loading, router]);

  // While checking, show a minimal theme-responsive loading screen (matches section bg)
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gradient-to-b from-white to-slate-50 transition-colors duration-500 dark:from-[#0a0a0f] dark:to-[#12121a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase transition-colors duration-500 dark:text-slate-400">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  // If not visible, redirect is already triggered above — return null to avoid flash
  if (!visible) return null;

  return <LotteryDrawSection />;
}
