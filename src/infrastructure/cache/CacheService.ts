/* eslint-disable @typescript-eslint/no-explicit-any */
import NodeCache from 'node-cache';

export class CacheService {
  private cache: NodeCache;

  constructor(ttlSeconds: number = 600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl: number = 600): void {
    this.cache.set(key, value, ttl);
  }

  delete(key: string): number {
    return  this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  static generateKeyCache(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
    .sort()
    .reduce((obj: Record<string, any>, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        obj[key] = params[key];
      }
      return obj;
    }, {});

    return `${prefix}_${JSON.stringify(sortedParams)}`;
  }
}