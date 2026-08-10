import { MediaEventName, MediaEventPayloads } from './types';

type EventHandler<T extends MediaEventName> = (payload: MediaEventPayloads[T]) => void;

export class MediaEventEmitter {
  private listeners: {
    [K in MediaEventName]?: EventHandler<K>[];
  } = {};

  constructor() {
    // Default listener to log events
    this.on('view', (payload) => console.log(`[MediaCore] View event:`, payload));
    this.on('download', (payload) => console.log(`[MediaCore] Download event:`, payload));
    this.on('error', (payload) => console.error(`[MediaCore] Error event:`, payload));
    this.on('fetch', (payload) => console.log(`[MediaCore] Fetch event:`, payload));
  }

  on<K extends MediaEventName>(event: K, handler: EventHandler<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  off<K extends MediaEventName>(event: K, handler: EventHandler<K>): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = (this.listeners[event]!.filter((h) => h !== handler) as any);
  }

  emit<K extends MediaEventName>(event: K, payload: MediaEventPayloads[K]): void {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[MediaCore] Error in event listener for ${event}:`, err);
      }
    });
  }
}
