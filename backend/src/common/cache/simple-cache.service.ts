import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple in-memory cache service
 * No external dependencies, production-ready
 */
@Injectable()
export class SimpleCacheService {
  private readonly logger = new Logger(SimpleCacheService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 300000; // 5 minutes in milliseconds

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const ttlMs = ttl || this.defaultTTL;
    const expiresAt = Date.now() + ttlMs;

    this.cache.set(key, {
      data: value,
      expiresAt,
    });
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const activeEntries = entries.filter(e => e.expiresAt > now);

    return {
      totalKeys: this.cache.size,
      activeKeys: activeEntries.length,
      expiredKeys: entries.length - activeEntries.length,
    };
  }

  /**
   * Clean expired entries (called periodically)
   */
  cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }
  }
}
