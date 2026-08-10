import { useState, useEffect, useRef } from 'react';
import { MediaProvider, useMediaSearch } from 'media-react';
import { useGrid, useLightbox, useReelSwiper } from 'media-ui-react';
import './App.css';

// Pexels API Key should ideally be from env vars
// Provide a placeholder or a free key if available.
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY || '';

function PhotoGrid({ query }: { query: string }) {
  const { data: photos, search, loadMore, hasMore, loading } = useMediaSearch('photo');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [initialLightboxIndex, setInitialLightboxIndex] = useState(0);

  // Initial search
  useEffect(() => {
    if (query) search(query);
  }, [query]);

  const { getGridProps, getGridItemProps } = useGrid({
    items: photos,
    onLoadMore: loadMore,
    hasMore,
  });

  const {
    getLightboxProps,
    getOverlayProps,
    getContentProps,
    currentItem,
    goToNext,
    goToPrev,
    hasNext,
    hasPrev,
  } = useLightbox({
    isOpen: lightboxOpen,
    onClose: () => setLightboxOpen(false),
    items: photos,
    initialIndex: initialLightboxIndex,
  });

  return (
    <div className="grid-container">
      <div className="photo-grid" {...getGridProps()}>
        {photos.map((photo: any, index: number) => (
          <div
            key={photo.id}
            className="photo-item"
            {...getGridItemProps(photo, index)}
            onClick={() => {
              setInitialLightboxIndex(index);
              setLightboxOpen(true);
            }}
          >
            <img src={photo.src.large} alt={photo.alt} loading="lazy" style={{ backgroundColor: photo.avg_color }} />
            <div className="photo-info-overlay">
              <div className="photo-author">{photo.photographer}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            Loading media...
          </div>
        )}
      </div>

      {lightboxOpen && currentItem && (
        <div className="lightbox-overlay" {...getOverlayProps()}>
          <div className="lightbox-content" {...getLightboxProps()} {...getContentProps()}>
            <button className="close-btn" onClick={() => setLightboxOpen(false)}>✕</button>

            {hasPrev && (
              <button className="nav-btn prev" onClick={goToPrev}>←</button>
            )}

            {(() => {
              const currentPhoto = currentItem as any;
              return <img src={currentPhoto.src.large} alt={currentPhoto.alt} className="lightbox-image" />
            })()}

            {hasNext && (
              <button className="nav-btn next" onClick={goToNext}>→</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReelVideo({ src, poster, isActive, isMuted, onClick }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      loop
      playsInline
      className="reel-video"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    />
  );
}

function VideoReels({ query }: { query: string }) {
  const { data: videos, search, loadMore, loading, hasMore } = useMediaSearch('video');
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (query) search(query);
  }, [query]);

  const { getSwiperProps, getSwiperItemProps } = useReelSwiper({
    items: videos,
    onActiveIndexChange: (index: number) => {
      // Trigger load more if we are near the end
      if (index >= videos.length - 2 && hasMore && !loading) {
        loadMore();
      }
    }
  });

  return (
    <div className="reels-container" {...getSwiperProps()}>
      {videos.map((video: any, index: number) => {
        const itemProps = getSwiperItemProps(index);
        const isActive = itemProps['data-active'];
        const videoFile = video.video_files.find((f: any) => f.quality === 'hd') || video.video_files[0];

        return (
          <div key={`${video.id}-${index}`} className="reel-item" {...itemProps}>
            <ReelVideo
              src={videoFile.link}
              poster={video.image}
              isActive={isActive}
              isMuted={isMuted}
              onClick={() => setIsMuted(!isMuted)}
            /><div className="reel-info">
              <h3>{video.user.name}</h3>
              <p>{video.duration}s • {isMuted ? '🔇 Tap to Unmute' : '🔊 Tap to Mute'}</p>
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          Loading reels...
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const [query, setQuery] = useState('nature');
  const [searchInput, setSearchInput] = useState('nature');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Media Explorer</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search high-res photos & videos..."
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        <div className="type-toggle">
          <button
            className={mediaType === 'photo' ? 'active' : ''}
            onClick={() => setMediaType('photo')}
          >
            Photos
          </button>
          <button
            className={mediaType === 'video' ? 'active' : ''}
            onClick={() => setMediaType('video')}
          >
            Reels
          </button>
        </div>
      </header>

      <main className="app-main">
        {mediaType === 'photo' ? (
          <PhotoGrid key={`photo-${query}`} query={query} />
        ) : (
          <VideoReels key={`video-${query}`} query={query} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <MediaProvider config={{ apiKey: API_KEY }}>
      <AppContent />
    </MediaProvider>
  );
}

export default App;
