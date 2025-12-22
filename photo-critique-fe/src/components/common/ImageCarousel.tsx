import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePreview } from "./ImagePreview";

interface ImageCarouselProps {
  images: string[];
  className?: string;
  initialIndex?: number;
  showIndicators?: boolean;
  onIndexChange?: (index: number) => void;
  autoPlayMs?: number | null;
  fitMode?: "contain" | "cover";
  hideNavigation?: boolean;
  showPreview?: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  className = "",
  initialIndex = 0,
  showIndicators = true,
  onIndexChange,
  autoPlayMs = null,
  fitMode = "contain",
  hideNavigation = false,
  showPreview = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const autoplayRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // create a copy of images with 3 elements to create infinite effect
  const extendedImages = images.length > 1
    ? [images[images.length - 1], ...images, images[0]]
    : images;

  // calculate actual index in extendedImages
  const displayIndex = images.length > 1 ? currentIndex + 1 : currentIndex;

  const changeIndex = useCallback(
    (next: number, immediate = false) => {
      if (isTransitioning && !immediate) return;

      setIsTransitioning(true);

      // if immediate = true, change immediately without transition
      if (immediate) {
        setCurrentIndex(next);
        setIsTransitioning(false);
        if (onIndexChange) onIndexChange(next);
        return;
      }

      setCurrentIndex(next);

      // call callback after transition is complete
      setTimeout(() => {
        setIsTransitioning(false);
        if (onIndexChange) onIndexChange(next);
      }, 300);
    },
    [onIndexChange, isTransitioning]
  );

  const next = useCallback(() => {
    if (isTransitioning) return;

    if (currentIndex === images.length - 1) {
      // if current index is the last image, change to the first image (without transition)
      changeIndex(0, true);
    } else {
      changeIndex(currentIndex + 1);
    }
  }, [currentIndex, changeIndex, images.length, isTransitioning]);

  const prev = useCallback(() => {
    if (isTransitioning) return;

    if (currentIndex === 0) {
      // if current index is the first image, change to the last image (without transition)
      changeIndex(images.length - 1, true);
    } else {
      changeIndex(currentIndex - 1);
    }
  }, [currentIndex, changeIndex, images.length, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;

    // calculate direction to optimize animation
    const diff = index - currentIndex;
    const absDiff = Math.abs(diff);

    // if moving far (more than 1 image), use immediate transition
    if (absDiff > 1 && absDiff < images.length - 1) {
      changeIndex(index, true);
    } else {
      changeIndex(index);
    }
  }, [currentIndex, changeIndex, images.length, isTransitioning]);

  // handle swipe on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        next(); // Swipe left -> next
      } else {
        prev(); // Swipe right -> prev
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }, [next, prev]);

  // Autoplay
  useEffect(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }

    if (autoPlayMs && autoPlayMs > 0 && images.length > 1) {
      autoplayRef.current = window.setInterval(() => {
        next();
      }, autoPlayMs);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [autoPlayMs, next, images.length]);

  // reset touch when currentIndex changes
  useEffect(() => {
    touchStartX.current = null;
    touchEndX.current = null;
  }, [currentIndex]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div
        className={`relative w-full h-full flex items-center justify-center bg-black/50 rounded-3xl overflow-hidden ${className}`}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background blur */}
        {fitMode === "contain" && images.length > 0 && (
          <div
            className="absolute inset-0 transition-all duration-300 ease-out"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
              transform: "scale(1.05)",
            }}
          />
        )}

        {/* Overlay */}
        {fitMode === "contain" && (
          <div className="absolute inset-0 bg-black/30 transition-opacity duration-300" />
        )}

        {/* Slide container */}
        <div className="relative w-full h-full overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${displayIndex * 100}%)`,
              transition: isTransitioning ? 'transform 300ms ease-out' : 'none',
            }}
          >
            {extendedImages.map((img, i) => (
              <div
                key={`${i}-${img}`}
                className="relative h-full w-full flex-none flex items-center justify-center overflow-hidden"
              >
                <img
                  src={img}
                  alt={`slide-${i}`}
                  draggable={false}
                  className={`relative z-2 select-none ${fitMode === "cover" ? "w-full h-full" : "max-w-full max-h-full"
                    } ${showPreview ? "cursor-pointer" : ""}`}
                  style={{
                    objectFit: fitMode,
                    backgroundColor: fitMode === "contain" ? "rgba(0,0,0,0.3)" : undefined,
                    transition: "opacity 300ms ease-out",
                    opacity: isTransitioning ? 0.9 : 1,
                    ...(fitMode === "cover" ? { transform: "scale(1.01)" } : {}),
                  }}
                  loading="lazy"
                  onClick={(e) => {
                    if (showPreview) {
                      e.stopPropagation();
                      setIsPreviewOpen(true);
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && !hideNavigation && (
            <>
              <button
                role="button"
                tabIndex={0}
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-black/40 active:scale-95 transition-all duration-200 z-10 backdrop-blur-sm opacity-70 cursor-pointer"
                disabled={isTransitioning}
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              <button
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-black/40 active:scale-95 transition-all duration-200 z-10 backdrop-blur-sm opacity-70 cursor-pointer"
                disabled={isTransitioning}
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Indicators */}
          {showIndicators && images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 opacity-70">
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(i);
                  }}
                  className={`transition-all duration-300 ${i === currentIndex
                      ? "bg-white scale-110"
                      : "bg-white/40 hover:bg-white/60"
                    }`}
                  style={{
                    width: i === currentIndex ? "24px" : "8px",
                    cursor: i === currentIndex ? "auto" : "pointer",
                    height: "8px",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar for autoplay */}
        {autoPlayMs && images.length > 1 && (
          <div className="absolute top-2 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden z-10">
            <div
              className="h-full bg-white/60 transition-all duration-300 ease-linear"
              style={{
                width: isTransitioning ? '100%' : '0%',
              }}
            />
          </div>
        )}
      </div>
      {/* Image Preview Modal */}
      {isPreviewOpen && showPreview && (
        <ImagePreview
          images={images}
          initialIndex={currentIndex}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
};