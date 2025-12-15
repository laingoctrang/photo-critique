import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Quote = {
  id: string;
  text: string;
  // highlight: substring to highlight (first occurrence, case-insensitive)
  highlight?: string;
  // optional color class for highlight (Tailwind), defaults to 'text-indigo-600'
  highlightClass?: string;
};

const SESSION_KEY = "one_time_banner_shown_v1";

const QUOTES: Quote[] = [
  {
    id: "q1",
    text: "Discover fresh creators and surprise yourself every scroll.",
    highlight: "discover",
  },
  {
    id: "q2",
    text: "Tap into inspiration — every photo tells a new story.",
    highlight: "inspiration",
  },
  {
    id: "q3",
    text: "Join a community that gives real feedback and real edits.",
    highlight: "feedback",
  },
  {
    id: "q4",
    text: "Find your next favorite shot within moments of browsing.",
    highlight: "favorite",
  },
  {
    id: "q5",
    text: "Start exploring — creativity is contagious here.",
    highlight: "creativity",
  },
  {
    id: "q6",
    text: "Scroll, learn, and try edits instantly with visual suggestions.",
    highlight: "learn",
  },
  {
    id: "q7",
    text: "See how small edits change the entire mood of a photo.",
    highlight: "edits",
  },
  {
    id: "q8",
    text: "Your next lesson in composition might be one click away.",
    highlight: "composition",
  }
];

function pickRandomIndex(excludeIndex: number | null, poolLength: number) {
  if (poolLength === 0) return 0;
  if (poolLength === 1) return 0;
  let next = Math.floor(Math.random() * poolLength);
  let attempts = 0;
  while (excludeIndex !== null && next === excludeIndex && attempts < 8) {
    next = Math.floor(Math.random() * poolLength);
    attempts++;
  }
  return next;
}

function renderWithHighlight(text: string, highlight?: string, highlightClass = "text-[#15B8A6] font-bold") {
  if (!highlight) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerKey = highlight.toLowerCase();
  const idx = lowerText.indexOf(lowerKey);
  if (idx === -1) return <>{text}</>;

  const before = text.slice(0, idx);
  const matched = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);

  return (
    <>
      {before}
      <span className={`${highlightClass}`}>{matched}</span>
      {after}
    </>
  );
}

export const Banner = () => {
  const pool = useMemo(() => QUOTES, []);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState<number>(() => Math.floor(Math.random() * pool.length));
  const [viewedIndices, setViewedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const shown = sessionStorage.getItem(SESSION_KEY);
    if (!shown) {
      setVisible(true);
      setViewedIndices(new Set([index]));
      setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
      }, 0);
    }
  }, [index]);

  if (!visible) return null;

  const q = pool[index];

  const onClose = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
  };

  const onNext = () => {
    const nextIndex = pickRandomIndex(index, pool.length);
    setIndex(nextIndex);
    setViewedIndices((prev) => new Set([...prev, nextIndex]));
  };

  const hasViewedAll = viewedIndices.size >= pool.length;

  return (
    <div className="max-w-3xl mx-auto pb-4">
      <div
        role="region"
        aria-label="Welcome banner"
        className="relative overflow-hidden transition-opacity duration-300 ease-out"
      >
        <div className="flex items-start sm:items-center gap-4">

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              className="text-gray-900 text-lg sm:text-xl md:text-2xl font-semibold leading-tight"
              aria-live="polite"
            >
              {renderWithHighlight(q.text, q.highlight, q.highlightClass)}
            </p>
            <p className="mt-2 text-sm text-gray-500">Start exploring the feed — inspiration is a scroll away.</p>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {!hasViewedAll && (
              <button
                onClick={onNext}
                type="button"
                className="text-gray-500 hover:text-[#13A595] transition-colors cursor-pointer border-none outline-none"
                aria-label="Show another message"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              type="button"
              aria-label="Close banner"
              className="text-sm text-gray-500 hover:text-[#13A595] p-2 rounded-lg transition-colors cursor-pointer border-none outline-none"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
