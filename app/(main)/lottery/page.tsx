import type { Metadata } from 'next';
import LotteryClientSection from '@/src/components/lottery/LotteryClientSection';

export const metadata: Metadata = {
  title: 'Lucky Draw | SVI Infra Solutions',
  description:
    'Participate in the SVI Infra live lucky draw. Watch the exclusive residential plot and luxury villa giveaway reveal in real time — verified and audited on Supabase.',
  openGraph: {
    title: 'Lucky Draw | SVI Infra Solutions',
    description:
      'Watch the SVI Infra live lucky draw — exclusive residential plots and luxury villas for registered investors.',
    type: 'website',
  },
};

export default function LotteryPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 pt-32 pb-0 transition-colors duration-500 md:pt-40 dark:from-[#0a0a0f] dark:to-[#10101a]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#c9a84c 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.25em] text-[#B38728] uppercase backdrop-blur-sm dark:text-[#D4AF37]">
            ✦ Official Lucky Draw Portal
          </span>
          <h1 className="mb-6 font-serif text-4xl font-bold text-slate-900 transition-colors duration-500 md:text-6xl dark:text-white">
            SVI Infra{' '}
            <span
              className="italic"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Mega Giveaway
            </span>
          </h1>
          <p className="mx-auto mb-0 max-w-xl text-sm leading-relaxed text-slate-600 transition-colors duration-500 md:text-base dark:text-slate-400">
            Exclusive residential plot and luxury villa lucky drawings for registered SVI investors
            and buyers. All draws are provably fair, audited, and processed via cryptographically
            secure database procedures.
          </p>
        </div>
      </section>

      {/* Full draw section */}
      <LotteryClientSection />
    </main>
  );
}
