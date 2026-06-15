'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Map, MapPin, Building, Ruler, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TIMELINE_STEPS = [
  {
    title: 'Land Acquisition',
    desc: 'Strategic identification and acquisition of high-potential land parcels in growth corridors.',
    icon: <Map className="h-6 w-6" />,
  },
  {
    title: 'Planning & Design',
    desc: 'Collaborating with top architects to design sustainable, Vastu-compliant master plans.',
    icon: <Ruler className="h-6 w-6" />,
  },
  {
    title: 'Approvals & RERA',
    desc: 'Securing all necessary government clearances to ensure 100% legal security and transparency.',
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  {
    title: 'Infrastructure Development',
    desc: 'Executing world-class infrastructure including roads, electricity, water, and landscaping.',
    icon: <Building className="h-6 w-6" />,
  },
  {
    title: 'Delivery & Handover',
    desc: 'On-time possession with complete documentation and seamless transition for our buyers.',
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
];

export default function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      ref={containerRef}
      className="bg-brand-navy relative overflow-hidden py-24 text-white"
      role="region"
      aria-label="Development Timeline"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="bg-brand-gold absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-brand-gold absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-20 text-center">
          <h4 className="text-brand-gold mb-4 text-[10px] font-semibold tracking-[0.2em] uppercase">
            Development Process
          </h4>
          <h2 className="font-serif text-3xl md:text-5xl">How We Build The Future</h2>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Central Line Track */}
          <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-white/10 md:left-1/2 md:-ml-[1px]" />

          {/* Animated Fill Line */}
          <motion.div
            className="bg-brand-gold absolute top-0 left-8 w-[2px] md:left-1/2 md:-ml-[1px]"
            style={{ height: lineHeight, transformOrigin: 'top' }}
          />

          <div className="flex flex-col gap-12 md:gap-24">
            {TIMELINE_STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div key={idx} className="relative flex flex-col md:flex-row md:items-center">
                  {/* Icon Marker */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="border-brand-navy bg-brand-gold text-brand-navy absolute left-8 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 shadow-[0_0_15px_rgba(212,175,55,0.4)] md:left-1/2"
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content Container */}
                  <div
                    className={`ml-16 w-full md:ml-0 md:w-1/2 ${
                      isEven ? 'text-left md:pr-16 md:text-right' : 'text-left md:ml-auto md:pl-16'
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10"
                    >
                      <h3 className="text-brand-gold mb-3 font-serif text-2xl">{step.title}</h3>
                      <p className="leading-relaxed text-white/70">{step.desc}</p>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
