import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  className?: string;
  initialIndex?: number;
  showIndicators?: boolean;
  onIndexChange?: (index: number) => void;
  autoPlayMs?: number | null;
  aspectRatio?: number | null;
  fitMode?: "contain" | "cover";
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  className = "",
  initialIndex = 0,
  showIndicators = true,
  onIndexChange,
  autoPlayMs = null,
  aspectRatio = null,
  fitMode = "contain",
}) => {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  );
  const [isFading, setIsFading] = useState(false);
  const autoplayRef = useRef<number | null>(null);

  const safeLen = images.length || 1;

  const changeIndex = useCallback(
    (next: number) => {
      const normalized = ((next % safeLen) + safeLen) % safeLen;
      setIsFading(true);
      setTimeout(() => {
        setIndex(normalized);
        setIsFading(false);
        if (onIndexChange) onIndexChange(normalized);
      }, 160);
    },
    [safeLen, onIndexChange]
  );

  const next = useCallback(() => changeIndex(index + 1), [index, changeIndex]);
  const prev = useCallback(() => changeIndex(index - 1), [index, changeIndex]);

  // autoplay
  useEffect(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    if (autoPlayMs && autoPlayMs > 0) {
      autoplayRef.current = window.setInterval(
        () => next(),
        autoPlayMs
      ) as unknown as number;
    }
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [autoPlayMs, next]);

  if (!images || images.length === 0) return null;

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-black-50 rounded-4xl ${className}`}
      // style={
      //   aspectRatio
      //     ? { aspectRatio: `${aspectRatio}` }
      //     : { width: "100%", height: "100%" }
      // }
    >
      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src={images[index]}
          alt={`image-${index}`}
          draggable={false}
          className={`transition-opacity duration-300 ${
            isFading ? "opacity-30" : "opacity-100"
          } ${fitMode === "cover" ? "w-full h-full" : "max-w-full max-h-full"}`}
          style={{
            objectFit: fitMode,
            backgroundColor:
              fitMode === "contain" ? "rgba(0,0,0,0.5)" : undefined,
          }}
        />

        {/* Left overlay */}
        {images.length > 1 && (
          <button
            role="button"
            tabIndex={0}
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/10 text-white hover:bg-black/30 transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}

        {/* Right Button */}
        {images.length > 1 && (
          <button
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/10 text-white hover:bg-black/30 transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        )}

        {/* Indicators */}
        {showIndicators && images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  changeIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
