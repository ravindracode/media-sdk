import { useState, useCallback, useEffect, useRef } from 'react';

// Grid Hook
export interface UseGridProps<T> {
  items: T[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function useGrid<T>({ items, onLoadMore, hasMore }: UseGridProps<T>) {
  const getGridProps = () => ({
    data: items,
    onEndReached: () => {
      if (hasMore && onLoadMore) {
        onLoadMore();
      }
    },
    onEndReachedThreshold: 0.5,
  });

  return {
    getGridProps,
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
    visible: isOpen,
    transparent: true,
    onRequestClose: onClose,
  });

  const getOverlayProps = () => ({
    onPress: onClose,
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
  };
}

// Reel Swiper Hook
export interface UseReelSwiperProps<T> {
  items: T[];
  onActiveIndexChange?: (index: number) => void;
}

export function useReelSwiper<T>({ items, onActiveIndexChange }: UseReelSwiperProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);

  const getSwiperProps = () => ({
    data: items,
    pagingEnabled: true,
    showsVerticalScrollIndicator: false,
    onViewableItemsChanged: useRef(({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null && index !== undefined) {
          setActiveIndex(index);
          onActiveIndexChange?.(index);
        }
      }
    }).current,
    viewabilityConfig: {
      itemVisiblePercentThreshold: 50,
    },
  });

  return {
    activeIndex,
    activeItem: items[activeIndex],
    getSwiperProps,
  };
}
