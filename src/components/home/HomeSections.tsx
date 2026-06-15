'use client';

import dynamic from 'next/dynamic';

const AboutSection = dynamic(() => import('@/src/components/home/AboutSection'), { ssr: false });
const FeaturesSection = dynamic(() => import('@/src/components/home/FeaturesSection'), {
  ssr: false,
});
const ProjectsSection = dynamic(() => import('@/src/components/home/ProjectsSection'), {
  ssr: false,
});
const LeadershipSection = dynamic(() => import('@/src/components/home/LeadershipSection'), {
  ssr: false,
});
const TimelineSection = dynamic(() => import('@/src/components/home/TimelineSection'), {
  ssr: false,
});
const CTASection = dynamic(() => import('@/src/components/home/CTASection'), { ssr: false });
const LotteryCTA = dynamic(() => import('@/src/components/lottery/LotteryCTA'), { ssr: false });
const StatsCounter = dynamic(() => import('@/src/components/ui/StatsCounter'), { ssr: false });
const HomeFAQ = dynamic(() => import('@/src/components/home/HomeFAQ'), { ssr: false });

export default function HomeSections() {
  return (
    <>
      <AboutSection />
      <section className="bg-brand-navy border-brand-gold border-opacity-30 relative overflow-hidden border-y">
        <StatsCounter />
      </section>
      <FeaturesSection />
      <TimelineSection />
      <ProjectsSection />
      <LeadershipSection />
      <LotteryCTA />
      <HomeFAQ />
      <CTASection />
    </>
  );
}
