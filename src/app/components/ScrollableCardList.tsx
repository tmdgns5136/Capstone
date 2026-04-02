import { useRef, useState, useEffect, useCallback, Children } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollableCardListProps {
  children: React.ReactNode;
  className?: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function ScrollableCardList({ children, className = "", initialPage = 0, onPageChange }: ScrollableCardListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [endPadding, setEndPadding] = useState(0);
  const initialScrollDone = useRef(false);

  const childCount = Children.count(children);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Calculate how many cards fit in one page
    const firstChild = el.children[0] as HTMLElement | undefined;
    if (!firstChild) return;
    const gap = 16;
    const cardWidth = firstChild.offsetWidth + gap;
    const visibleCount = Math.max(1, Math.floor((el.clientWidth + gap) / cardWidth));
    const remainder = childCount % visibleCount;

    // Add padding so last page fills a full page width
    if (remainder > 0 && childCount > visibleCount) {
      const missingCards = visibleCount - remainder;
      setEndPadding(missingCards * cardWidth);
    } else {
      setEndPadding(0);
    }

    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);

    // Calculate pages based on card count, not scrollWidth (which includes padding)
    const pages = Math.ceil(childCount / visibleCount);
    setTotalPages(pages);

    if (pages <= 1) {
      setActiveIndex((prev) => {
        if (prev !== 0) onPageChange?.(0);
        return 0;
      });
    } else {
      const pageWidth = el.clientWidth;
      const currentPage = Math.min(Math.round(el.scrollLeft / pageWidth), pages - 1);
      setActiveIndex((prev) => {
        if (prev !== currentPage) onPageChange?.(currentPage);
        return currentPage;
      });
    }
  }, [children, childCount, onPageChange]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    // Scroll to initialPage on first mount
    if (!initialScrollDone.current && initialPage > 0) {
      initialScrollDone.current = true;
      requestAnimationFrame(() => {
        el.scrollTo({ left: initialPage * el.clientWidth, behavior: "instant" });
      });
    }
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkScroll, initialPage]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by exactly one full page (container width)
    const amount = el.clientWidth;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const scrollToPage = (page: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
  };

  const showControls = totalPages > 1;

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        {/* Left arrow area */}
        <div className="shrink-0 w-9">
          {activeIndex > 0 && (
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:shadow-md hover:border-zinc-300 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth flex-1 min-w-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
          {endPadding > 0 && <div className="shrink-0" style={{ width: endPadding }} />}
        </div>

        {/* Right arrow area */}
        <div className="shrink-0 w-9">
          {activeIndex < totalPages - 1 && (
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:shadow-md hover:border-zinc-300 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Page dots */}
      {showControls && totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              className={`rounded-full transition-all ${
                i === activeIndex
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-zinc-200 hover:bg-zinc-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
