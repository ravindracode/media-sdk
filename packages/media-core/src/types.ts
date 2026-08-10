export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface Video {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
  video_pictures: {
    id: number;
    picture: string;
    nr: number;
  }[];
}

export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

export interface PhotosResponse extends PaginatedResponse<Photo> {
  photos: Photo[];
}

export interface VideosResponse extends PaginatedResponse<Video> {
  videos: Video[];
}

export type MediaType = 'photo' | 'video';

export interface SearchParams {
  query: string;
  page?: number;
  per_page?: number;
}

export interface TrendingParams {
  page?: number;
  per_page?: number;
}

export type MediaEventName = 'view' | 'download' | 'error' | 'fetch';

export interface MediaEventPayloads {
  view: { id: number; type: MediaType };
  download: { id: number; type: MediaType; quality?: string };
  error: { message: string; error?: any };
  fetch: { url: string };
}
