import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';

// Grid Hook
export interface UseGridProps<T> {
  items: T[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function useGrid<T>({ items, onLoadMore, hasMore }: UseGridProps<T>) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasMore) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && onLoadMore) {
          onLoadMore();
        }
      });
      observerRef.current.observe(node);
    },
    [hasMore, onLoadMore]
  );

  const getGridProps = () => ({
    role: 'grid',
    'aria-label': 'Media grid',
  });

  const getGridItemProps = (item: T, index: number) => {
    const isLast = index === items.length - 1;
    return {
      role: 'gridcell',
      ref: isLast ? lastElementRef : undefined,
    };
  };

  return {
    getGridProps,
    getGridItemProps,
  };
}

// Lightbox Hook
export interface UseLightboxProps<T> {
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  initialIndex?: number;
}

export function useLightbox<T>({ isOpen, onClose, items, initialIndex = 0 }: UseLightboxProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const getLightboxProps = () => ({
    role: 'dialog',
    'aria-modal': true,
    tabIndex: -1,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    },
  });

  const getOverlayProps = () => ({
    onClick: onClose,
  });

  const getContentProps = () => ({
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  });

  return {
    currentIndex,
    currentItem: items[currentIndex],
    goToNext,
    goToPrev,
    hasNext: currentIndex < items.length - 1,
    hasPrev: currentIndex > 0,
    getLightboxProps,
    getOverlayProps,
    getContentProps,
  };
}

// Reel Swiper Hook
export interface UseReelSwiperProps<T> {
  items: T[];
  onActiveIndexChange?: (index: number) => void;
}

export function useReelSwiper<T>({ items, onActiveIndexChange }: UseReelSwiperProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < items.length) {
        setActiveIndex(newIndex);
        onActiveIndexChange?.(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex, items.length, onActiveIndexChange]);

  const getSwiperProps = () => ({
    ref: containerRef,
    style: {
      overflowY: 'scroll' as const,
      scrollSnapType: 'y mandatory' as const,
      height: '100vh',
    },
  });

  const getSwiperItemProps = (index: number) => ({
    style: {
      scrollSnapAlign: 'start' as const,
      height: '100vh',
    },
    'data-active': index === activeIndex,
  });

  return {
    activeIndex,
    activeItem: items[activeIndex],
    getSwiperProps,
    getSwiperItemProps,
  };
}
