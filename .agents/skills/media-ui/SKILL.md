---
name: media-ui
description: How to use the headless media-ui-react components to build accessible, styled UI
---

# Using Headless Components with `media-ui-react`

The `media-ui-react` package (and `media-ui-native` for React Native) provides **headless** UI components. This means it provides the logic, state management, and accessibility attributes, but **zero styles and zero markup**.

You are responsible for supplying the DOM elements and styling them.

## Core Pattern: Prop Getters

The hooks expose "prop getters" (functions like `getGridProps`, `getLightboxProps`) that return an object of props (such as `role`, `aria-*`, `tabIndex`, event handlers). You **MUST spread** these onto your DOM elements to ensure the components function correctly and remain accessible.

## 1. Grid (`useGrid`)

`useGrid` helps you build an infinite scrolling grid.

**Requirements**:
- Pass your array of items and a `onLoadMore` callback.
- Spread `getGridProps()` onto the container element.
- Spread `getGridItemProps(item, index)` onto each child element. This is crucial for the IntersectionObserver to detect the last item and trigger `onLoadMore`.

```tsx
import { useGrid } from 'media-ui-react';

function MyGrid({ items, loadMore, hasMore }) {
  const { getGridProps, getGridItemProps } = useGrid({
    items,
    onLoadMore: loadMore,
    hasMore
  });

  return (
    <div className="my-grid" {...getGridProps()}>
      {items.map((item, index) => (
        <div key={item.id} className="grid-cell" {...getGridItemProps(item, index)}>
          <img src={item.url} alt="Media" />
        </div>
      ))}
    </div>
  );
}
```

## 2. Lightbox (`useLightbox`)

`useLightbox` manages the state for a modal image/video viewer, including keyboard navigation (`Escape` to close, `ArrowLeft`/`ArrowRight` to navigate).

**Requirements**:
- You must render the overlay and content manually conditionally when `isOpen` is true.
- Spread `getOverlayProps()` on the backdrop (handles click-outside to close).
- Spread `getLightboxProps()` and `getContentProps()` on the dialog container (handles a11y roles and keyboard events).

```tsx
import { useLightbox } from 'media-ui-react';

function MyLightbox({ isOpen, onClose, items, initialIndex }) {
  const {
    getLightboxProps,
    getOverlayProps,
    getContentProps,
    currentItem,
    goToNext,
    goToPrev
  } = useLightbox({ isOpen, onClose, items, initialIndex });

  if (!isOpen || !currentItem) return null;

  return (
    <div className="backdrop" {...getOverlayProps()}>
      <div className="dialog" {...getLightboxProps()} {...getContentProps()}>
        <button onClick={goToPrev}>Prev</button>
        <img src={currentItem.url} />
        <button onClick={goToNext}>Next</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

## 3. Reel Swiper (`useReelSwiper`)

`useReelSwiper` manages vertical scroll-snapping (like TikTok/Reels) and detecting the active item.

**Requirements**:
- Spread `getSwiperProps()` on the scrolling container (applies `scrollSnapType`).
- Spread `getSwiperItemProps(index)` on each child (applies `scrollSnapAlign`).
- Use the `data-active` property returned in `getSwiperItemProps` to conditionally auto-play videos.

```tsx
import { useReelSwiper } from 'media-ui-react';

function MyReels({ items }) {
  const { getSwiperProps, getSwiperItemProps } = useReelSwiper({ items });

  return (
    <div className="reels-container" {...getSwiperProps()}>
      {items.map((item, index) => {
        const props = getSwiperItemProps(index);
        const isActive = props['data-active'];
        
        return (
          <div key={item.id} className="reel" {...props}>
            <video src={item.video_url} autoPlay={isActive} loop muted />
          </div>
        );
      })}
    </div>
  );
}
```
