import { MediaEventEmitter } from './events';
import {
  Photo,
  PhotosResponse,
  SearchParams,
  TrendingParams,
  Video,
  VideosResponse,
} from './types';

export interface MediaClientConfig {
  apiKey: string;
}

export class MediaClient {
  private apiKey: string;
  public events: MediaEventEmitter;
  private cache: Map<string, any>;
  private baseUrl = 'https://api.pexels.com/v1';
  private videosBaseUrl = 'https://api.pexels.com/videos';

  constructor(config: MediaClientConfig) {
    if (!config.apiKey) {
      throw new Error('MediaClient requires an apiKey');
    }
    this.apiKey = config.apiKey;
    this.events = new MediaEventEmitter();
    this.cache = new Map();
  }

  private async fetchApi<T>(url: string, params: Record<string, any> = {}): Promise<T> {
    const urlObj = new URL(url);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        urlObj.searchParams.append(key, String(params[key]));
      }
    });

    const urlString = urlObj.toString();
    
    // Check cache
    if (this.cache.has(urlString)) {
      return this.cache.get(urlString) as T;
    }

    this.events.emit('fetch', { url: urlString });

    try {
      const response = await fetch(urlString, {
        headers: {
          Authorization: this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Basic in-memory cache, could be improved with expiration
      this.cache.set(urlString, data);
      
      return data as T;
    } catch (error) {
      this.events.emit('error', { message: 'Fetch failed', error });
      throw error;
    }
  }

  // Photos API
  async searchPhotos(params: SearchParams): Promise<PhotosResponse> {
    return this.fetchApi<PhotosResponse>(`${this.baseUrl}/search`, params);
  }

  async getCuratedPhotos(params: TrendingParams = {}): Promise<PhotosResponse> {
    return this.fetchApi<PhotosResponse>(`${this.baseUrl}/curated`, params);
  }

  async getPhoto(id: number): Promise<Photo> {
    return this.fetchApi<Photo>(`${this.baseUrl}/photos/${id}`);
  }

  // Videos API
  async searchVideos(params: SearchParams): Promise<VideosResponse> {
    return this.fetchApi<VideosResponse>(`${this.videosBaseUrl}/search`, params);
  }

  async getPopularVideos(params: TrendingParams = {}): Promise<VideosResponse> {
    return this.fetchApi<VideosResponse>(`${this.videosBaseUrl}/popular`, params);
  }

  async getVideo(id: number): Promise<Video> {
    return this.fetchApi<Video>(`${this.videosBaseUrl}/videos/${id}`);
  }
}
