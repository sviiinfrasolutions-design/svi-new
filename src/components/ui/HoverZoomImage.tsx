import { memo } from 'react';
import Image from 'next/image';

interface HoverZoomImageProps {
  src: string;
  alt: string;
  className?: string;
}

const HoverZoomImage = memo(function HoverZoomImage({
  src,
  alt,
  className = '',
}: HoverZoomImageProps) {
  return (
    <div className={`hover-zoom-container relative h-full w-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="hover-zoom-img object-cover"
        style={{
          transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
});

export default HoverZoomImage;
