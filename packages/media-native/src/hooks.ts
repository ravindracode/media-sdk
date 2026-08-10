import { useEffect, useState, useCallback, useRef } from 'react';
import { useMediaContext } from './Provider';
import {
  Photo,
  Video,
  PhotosResponse,
  VideosResponse,
  SearchParams,
  TrendingParams,
  MediaEventName,
  MediaEventPayloads
} from 'media-core';

export function useMediaSearch(type: 'photo' | 'video', initialParams?: SearchParams) {
  const { client } = useMediaContext();
  const [data, setData] = useState<(Photo | Video)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialParams?.page || 1);
  const [hasMore, setHasMore] = useState(true);

  // Keep track of the current query to avoid race conditions
  const currentQueryRef = useRef(initialParams?.query || '');

  const search = useCallback(async (query: string, reset = false) => {
    if (!query) return;
    
    currentQueryRef.current = query;
    setLoading(true);
    setError(null);
    
    const targetPage = reset ? 1 : page;
    
    try {
      if (type === 'photo') {
        const res = await client.searchPhotos({ query, page: targetPage, per_page: initialParams?.per_page || 15 });
        // Make sure this is still the relevant query
        if (currentQueryRef.current === query) {
          setData(prev => reset ? res.photos : [...prev, ...res.photos]);
          setHasMore(!!res.next_page);
          setPage(targetPage + 1);
        }
      } else {
        const res = await client.searchVideos({ query, page: targetPage, per_page: initialParams?.per_page || 15 });
        if (currentQueryRef.current === query) {
          setData(prev => reset ? res.videos : [...prev, ...res.videos]);
          setHasMore(!!res.next_page);
          setPage(targetPage + 1);
        }
      }
    } catch (err: any) {
      if (currentQueryRef.current === query) {
        setError(err);
      }
    } finally {
      if (currentQueryRef.current === query) {
        setLoading(false);
      }
    }
  }, [client, type, page, initialParams?.per_page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && currentQueryRef.current) {
      search(currentQueryRef.current);
    }
  }, [loading, hasMore, search]);

  return {
    data,
    loading,
    error,
    search: (query: string) => search(query, true),
    loadMore,
    hasMore
  };
}

export function useMediaTrending(type: 'photo' | 'video', params?: TrendingParams) {
  const { client } = useMediaContext();
  const [data, setData] = useState<(Photo | Video)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(params?.page || 1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrending = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    const targetPage = reset ? 1 : page;
    
    try {
      if (type === 'photo') {
        const res = await client.getCuratedPhotos({ page: targetPage, per_page: params?.per_page || 15 });
        setData(prev => reset ? res.photos : [...prev, ...res.photos]);
        setHasMore(!!res.next_page);
        setPage(targetPage + 1);
      } else {
        const res = await client.getPopularVideos({ page: targetPage, per_page: params?.per_page || 15 });
        setData(prev => reset ? res.videos : [...prev, ...res.videos]);
        setHasMore(!!res.next_page);
        setPage(targetPage + 1);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [client, type, page, params?.per_page]);

  useEffect(() => {
    fetchTrending(true);
  }, []); // Only fetch on mount or type change. In a real app we might want to handle deps better.

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchTrending();
    }
  }, [loading, hasMore, fetchTrending]);

  return {
    data,
    loading,
    error,
    loadMore,
    hasMore,
    refresh: () => fetchTrending(true)
  };
}

export function useMediaItem(type: 'photo' | 'video', id: number | null) {
  const { client } = useMediaContext();
  const [item, setItem] = useState<Photo | Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id === null) {
      setItem(null);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        if (type === 'photo') {
          const res = await client.getPhoto(id);
          setItem(res);
        } else {
          const res = await client.getVideo(id);
          setItem(res);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [client, type, id]);

  return { item, loading, error };
}

export function useMediaEvents<K extends MediaEventName>(event: K, handler: (payload: MediaEventPayloads[K]) => void) {
  const { events } = useMediaContext();
  
  useEffect(() => {
    if (!events) return;
    const unsubscribe = events.on(event, handler);
    return () => unsubscribe();
  }, [events, event, handler]);
}
