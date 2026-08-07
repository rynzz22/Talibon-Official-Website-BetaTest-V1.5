/**
 * In-Memory API Cache & Data State Manager
 * Supports short TTL for news/events, longer TTL for tourism/static content,
 * and cache invalidation tags.
 */

export type DataStateStatus = 'LIVE' | 'FALLBACK' | 'UNAVAILABLE' | 'ERROR';

export interface DataState<T> {
  data: T;
  status: DataStateStatus;
  errorMessage?: string;
  timestamp: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  tags: string[];
  status: DataStateStatus;
}

class ApiCacheManager {
  private cache = new Map<string, CacheItem<any>>();

  get<T>(key: string): CacheItem<T> | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > item.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return item as CacheItem<T>;
  }

  set<T>(key: string, data: T, ttlMs: number, tags: string[] = [], status: DataStateStatus = 'LIVE'): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
      tags,
      status
    });
  }

  invalidateTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCacheManager();
