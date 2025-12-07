import React, { useEffect, useRef, useState } from "react";

interface ContentExpandableProps {
  text: string;
  lines?: number;
  onExpandChange?: (expanded: boolean) => void;
  scrollTargetSelector?: string; // CSS selector để tìm post card để scroll
}

export const ContentExpandable: React.FC<ContentExpandableProps> = ({
  text,
  lines = 2,
  onExpandChange,
  scrollTargetSelector,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [collapsedHeightPx, setCollapsedHeightPx] = useState<number>(0);

  const textRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // compute line-height safely (fallback to 1.2 * fontSize)
  const getLineHeight = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight || "");
    if (!isNaN(lh) && lh > 0) return lh;
    const fs = parseFloat(cs.fontSize || "16");
    return fs * 1.2;
  };

  // measure overflow and collapsed height
  useEffect(() => {
    const el = textRef.current;
    if (!el) {
      setIsOverflowing(false);
      return;
    }

    // Ensure it's rendered before measuring
    requestAnimationFrame(() => {
      const lineH = getLineHeight(el);
      const collapsedH = Math.round(lineH * lines);
      setCollapsedHeightPx(collapsedH);

      // To detect overflow relative to 2 lines, temporarily compute using clamp style
      // We check actual scrollHeight of content (full height) vs collapsedH
      const fullHeight = el.scrollHeight;
      setIsOverflowing(fullHeight > collapsedH + 1); // small epsilon
    });
  }, [text, lines]);

  // Scroll to post when collapsing
  useEffect(() => {
    if (!expanded && isOverflowing) {
      // If we have a scroll target selector, scroll to the post card
      if (scrollTargetSelector && containerRef.current) {
        const postCard = containerRef.current.closest(scrollTargetSelector);
        if (postCard) {
          setTimeout(() => {
            postCard.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100); // Small delay to ensure DOM has updated
        }
      } else if (btnRef.current) {
        // Fallback: scroll to button
        btnRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [expanded, isOverflowing, scrollTargetSelector]);

  // Notify parent of expand state change
  useEffect(() => {
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]);

  const handleToggle = (newExpanded: boolean) => {
    setExpanded(newExpanded);
  };

  const onContentClick = (e: React.MouseEvent) => {
    // avoid toggling when clicking links or buttons inside the content
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) return;
    // Only allow collapsing (show less) when clicking content, not expanding
    if (expanded && isOverflowing) {
      handleToggle(false);
    }
  };

  return (
    <div className="p-4" ref={containerRef}>
      <div
        onClick={onContentClick}
        className="text-gray-800 transition-[max-height] duration-300 ease-in-out overflow-hidden cursor-text"
        // set maxHeight dynamically for smooth transition
        style={{
          maxHeight: expanded ? undefined : `${collapsedHeightPx}px`,
        }}
      >
        <div ref={textRef}>
          {text}
        </div>
      </div>

      {isOverflowing && (
        <div className="mt-1">
          <button
            ref={btnRef}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(!expanded);
            }}
            className="text-sm font-semibold text-[#15B8A6] hover:underline cursor-pointer"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
};
