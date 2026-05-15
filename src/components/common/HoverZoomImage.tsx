import { memo, useCallback, useState } from 'react';

const HoverZoomImage = memo(function HoverZoomImage({ src, alt }: { src: string; alt: string }) {
  const [backgroundPosition, setBackgroundPosition] = useState('50% 50%');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  }, []);

  const handleMouseLeave = useCallback(() => setBackgroundPosition('50% 50%'), []);

  return (
    <div
      className="w-full h-full relative cursor-zoom-in overflow-hidden group/zoom"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src + '&fm=webp'}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover/zoom:opacity-0 relative z-0"
      />
      <div
        className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 group-hover/zoom:opacity-100 z-10 transition-opacity duration-300 bg-gray-100"
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
