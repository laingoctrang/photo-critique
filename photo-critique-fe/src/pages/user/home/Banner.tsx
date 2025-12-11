import { useEffect, useMemo, useState } from "react";

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
    highlightClass: "text-indigo-600"
  },
  {
    id: "q2",
    text: "Tap into inspiration — every photo tells a new story.",
    highlight: "inspiration",
    highlightClass: "text-pink-500"
  },
  {
    id: "q3",
    text: "Join a community that gives real feedback and real edits.",
    highlight: "feedback",
    highlightClass: "text-green-600"
  },
  {
    id: "q4",
    text: "Find your next favorite shot within moments of browsing.",
    highlight: "favorite",
    highlightClass: "text-rose-500"
  },
  {
    id: "q5",
    text: "Start exploring — creativity is contagious here.",
    highlight: "creativity",
    highlightClass: "text-sky-600"
  },
  {
    id: "q6",
    text: "Scroll, learn, and try edits instantly with visual suggestions.",
    highlight: "learn",
    highlightClass: "text-yellow-600"
  },
  {
    id: "q7",
    text: "See how small edits change the entire mood of a photo.",
    highlight: "edits",
    highlightClass: "text-purple-600"
  },
  {
    id: "q8",
    text: "Your next lesson in composition might be one click away.",
    highlight: "composition",
    highlightClass: "text-emerald-600"
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

function renderWithHighlight(text: string, highlight?: string, highlightClass = "text-indigo-600 font-semibold") {
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

  // On mount: show only if not seen in this session
  useEffect(() => {
    try {
      const shown = sessionStorage.getItem(SESSION_KEY);
      if (!shown) {
        setVisible(true);
        // mark as shown so it won't show again in this tab on reload
        sessionStorage.setItem(SESSION_KEY, "1");
      } else {
        setVisible(false);
      }
    } catch {
      // if accessing sessionStorage fails, fallback to showing once per mount
      setVisible(true);
    }
  }, []);

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
    setIndex((prev) => pickRandomIndex(prev, pool.length));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
      <div
        role="region"
        aria-label="Welcome banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-indigo-50 to-rose-50 border border-gray-100 shadow-lg p-5 sm:p-6 md:p-8 transition-opacity duration-300 ease-out"
      >
        <div className="flex items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 p-2 rounded-xl bg-white/70 border border-gray-200 shadow-sm">
            <svg className="w-9 h-9 text-indigo-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3 7h7l-5.5 4 3 7L12 16l-7.5 4 3-7L2 9h7z" />
            </svg>
          </div>

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
            <button
              onClick={onNext}
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow transition-colors"
              aria-label="Show another message"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6" />
              </svg>
              Next
            </button>

            <button
              onClick={onClose}
              type="button"
              aria-label="Close banner"
              className="text-sm text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
