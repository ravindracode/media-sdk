---
name: media-data
description: How to wire data, auth, and events using the media-react wrapper
---

# Wiring Data with `media-react`

When building a UI that consumes the Headless Media SDK, you must use the `media-react` package (or `media-native` for React Native). This package provides a React Context Provider and customized hooks to interact with the Pexels API seamlessly without worrying about the underlying SDK core.

## Constraints & Rules
- **NEVER import from `media-core` directly** in the application layer. The app must only depend on `media-react`.
- **API Key Handling**: Do not pass the API key deep into components. It must be provided once at the root level via `MediaProvider`.

## 1. Setup Provider

Wrap your application (or the subtree needing media data) in the `MediaProvider`. It requires a configuration object containing the `apiKey`.

```tsx
import { MediaProvider } from 'media-react';

function App() {
  return (
    <MediaProvider config={{ apiKey: 'YOUR_PEXELS_API_KEY' }}>
      <YourAppContent />
    </MediaProvider>
  );
}
```

## 2. Using Hooks for Data Fetching

`media-react` provides typed hooks to fetch data:

- `useMediaSearch(type, initialParams)`
- `useMediaTrending(type, params)`
- `useMediaItem(type, id)`

`type` is always either `'photo'` or `'video'`.

**Example: Searching Photos**

```tsx
import { useMediaSearch } from 'media-react';

function PhotoGrid() {
  const { data, loading, error, search, loadMore, hasMore } = useMediaSearch('photo');

  // Trigger search on mount or interaction
  useEffect(() => {
    search('nature');
  }, []);

  return (
    <div>
      {data.map(photo => <img key={photo.id} src={photo.src.small} alt={photo.alt} />)}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

## 3. Events

The core SDK emits events (`view`, `download`, `error`, `fetch`). You can listen to these events anywhere inside the `MediaProvider` using the `useMediaEvents` hook.

```tsx
import { useMediaEvents } from 'media-react';

function EventLogger() {
  useMediaEvents('view', (payload) => {
    console.log('Media viewed:', payload.id, payload.type);
    // Send to analytics, etc.
  });

  return null;
}
```
