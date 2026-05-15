import { memo, useEffect, useRef, useState } from 'react';

interface StatProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const StatItem = memo(function StatItem({ end, label, suffix = '', duration = 2000 }: StatProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          let startTimestamp: number;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeProgress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => {
      if (nodeRef.current) observer.unobserve(nodeRef.current);
    };
  }, [end, duration, hasAnimated]);

  return (
    <div ref={nodeRef} className="text-center p-6">
      <div className="text-4xl md:text-5xl font-bold font-serif text-brand-gold mb-2">
        {count}{suffix}
      </div>
      <div className="text-gray-300 font-medium tracking-wide uppercase text-sm">
        {label}
      </div>
    </div>
  );
});

export default function StatsCounter() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
        <StatItem end={5000} suffix="+" label="Properties Sold" />
        <StatItem end={5000} suffix="+" label="Happy Clients" />
        <StatItem end={15} suffix="+" label="Years Experience" />
        <StatItem end={100} suffix="%" label="Success Rate" />
      </div>
    </div>
  );
}
