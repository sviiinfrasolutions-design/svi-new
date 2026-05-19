import { type MouseEvent, memo, useCallback, useState } from 'react';

const HoverZoomImage = memo(function HoverZoomImage({ src, alt }: { src: string; alt: string }) {
  const [backgroundPosition, setBackgroundPosition] = useState('50% 50%');

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  }, []);

  const handleMouseLeave = useCallback(() => setBackgroundPosition('50% 50%'), []);

  return (
    <div
      className="group/zoom relative h-full w-full cursor-zoom-in overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="relative z-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover/zoom:opacity-0"
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-gray-100 bg-no-repeat opacity-0 transition-opacity duration-300 group-hover/zoom:opacity-100"
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition,
          backgroundSize: '250%',
        }}
      />
    </div>
  );
});

export default HoverZoomImage;
