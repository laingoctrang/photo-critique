import { useState, useRef, useEffect, useCallback } from "react";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

interface ImagePreviewProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle zoom with mouse wheel - always zoom from center
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(0.5, Math.min(5, scale + delta));
      setScale(newScale);

      // Always keep image centered when zooming
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    },
    [scale]
  );

  // Handle drag - limit dragging to keep image visible
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && scale > 1 && imageRef.current && containerRef.current) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Calculate bounds to prevent dragging too far
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate max drag distance based on image size and scale
        const maxX = Math.max(0, (imgRect.width * scale - containerRect.width) / 2);
        const maxY = Math.max(0, (imgRect.height * scale - containerRect.height) / 2);
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
      }
    },
    [isDragging, dragStart, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom functions - always keep image centered
  const zoomIn = useCallback(() => {
    setScale((prevScale) => {
      const newScale = Math.min(5, prevScale + 0.5);
      // Keep centered when zooming in
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prevScale) => {
      const newScale = Math.max(0.5, prevScale - 0.5);
      // Reset position to center when zoom out to 1x or less
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDownload = useCallback(async () => {
    // Download image from Cloudinary
    let downloadUrl = currentImage;
  
    if (currentImage.includes("res.cloudinary.com")) {
      downloadUrl = currentImage.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );
    }

    window.open(downloadUrl, "_blank");
  
    // Fallback: fetch → blob
    try {
      const response = await fetch(currentImage, { mode: "cors" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = `${url}-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  }, [currentImage]);
  

  // Navigation
  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < images.length - 1) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, prevImage, nextImage, zoomIn, zoomOut, resetZoom]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close preview"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Download button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
        className="absolute top-4 right-20 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Download image"
      >
        <ArrowDownTrayIcon className="w-6 h-6" />
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomIn();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Zoom in"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomOut();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Zoom out"
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5" />
        </button>
        {scale !== 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Reset zoom"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}
        </>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg z-50">
        <p className="text-sm font-medium">
          {currentImage || "Untitled"} ({currentIndex + 1} / {images.length})
        </p>
      </div>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
      >
        <img
          ref={imageRef}
          src={currentImage}
          alt={`Preview ${currentIndex + 1}`}
          className="max-w-full max-h-full select-none"
          draggable={false}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        />
      </div>
    </div>
  );
};

