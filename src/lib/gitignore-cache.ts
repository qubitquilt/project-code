import { statSync } from 'node:fs';

import {
  GitignoreCache,
  GitignoreFile,
  GitignoreOptions,
} from '../types/index.js';

/**
 * Gitignore cache implementation for efficient .gitignore file parsing
 * Provides in-memory caching with TTL and size limits
 */
export class GitignoreCacheManager {
  private cache: GitignoreCache;
  private options: GitignoreOptions;

  constructor(options: GitignoreOptions) {
    this.options = options;
    this.cache = {
      files: new Map<string, GitignoreFile>(),
      hitCount: 0,
      lastUpdated: new Map<string, Date>(),
      missCount: 0,
    };
  }

  /**
   * Remove cache entries that are no longer valid (files don't exist or are modified)
   */
  cleanup(): void {
    const pathsToRemove: string[] = [];

    for (const [filePath, lastUpdated] of this.cache.lastUpdated.entries()) {
      // Check if file still exists and hasn't been modified
      if (this.isFileModified(filePath, lastUpdated)) {
        pathsToRemove.push(filePath);
      }
    }

    for (const path of pathsToRemove) {
      this.invalidate(path);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.files.clear();
    this.cache.lastUpdated.clear();
    this.cache.hitCount = 0;
    this.cache.missCount = 0;
  }

  /**
   * Get a cached gitignore file if it exists and is still valid
   */
  get(filePath: string): GitignoreFile | null {
    if (!this.options.cacheEnabled) {
      this.cache.missCount++;
      return null;
    }

    const cached = this.cache.files.get(filePath);
    const lastUpdated = this.cache.lastUpdated.get(filePath);

    if (!cached || !lastUpdated) {
      this.cache.missCount++;
      return null;
    }

    // Check if cache entry has expired (TTL)
    if (this.options.cacheTTL && this.options.cacheTTL > 0) {
      const age = Date.now() - lastUpdated.getTime();
      const ttlMs = this.options.cacheTTL * 1000; // Convert seconds to milliseconds

      if (age > ttlMs) {
        this.invalidate(filePath);
        this.cache.missCount++;
        return null;
      }
    }

    // Check if file has been modified on disk
    if (this.isFileModified(filePath, lastUpdated)) {
      this.invalidate(filePath);
      this.cache.missCount++;
      return null;
    }

    this.cache.hitCount++;
    return cached;
  }

  /**
   * Get all cached file paths
   */
  getCachedPaths(): string[] {
    return [...this.cache.files.keys()];
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.cache.hitCount + this.cache.missCount;
    const hitRate = totalRequests > 0 ? (this.cache.hitCount / totalRequests) * 100 : 0;

    return {
      hitCount: this.cache.hitCount,
      hitRate: Math.round(hitRate * 100) / 100,
      maxSize: this.options.cacheSize || 0,
      missCount: this.cache.missCount,
      size: this.cache.files.size,
      ttl: this.options.cacheTTL || 0,
    };
  }

  /**
   * Check if a path is cached
   */
  has(filePath: string): boolean {
    return this.cache.files.has(filePath);
  }

  /**
   * Invalidate a specific cache entry
   */
  invalidate(filePath: string): void {
    this.cache.files.delete(filePath);
    this.cache.lastUpdated.delete(filePath);
  }

  /**
   * Cache a parsed gitignore file
   */
  set(filePath: string, gitignoreFile: GitignoreFile): void {
    if (!this.options.cacheEnabled) {
      return;
    }

    // Check cache size limit
    if (this.options.cacheSize && this.cache.files.size >= this.options.cacheSize) {
      this.evictOldest();
    }

    this.cache.files.set(filePath, gitignoreFile);
    this.cache.lastUpdated.set(filePath, new Date());
  }

  /**
   * Update cache options
   */
  updateOptions(newOptions: Partial<GitignoreOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Remove the oldest cache entry to make room for new ones
   */
  private evictOldest(): void {
    let oldestPath: null | string = null;
    let oldestTime: Date | null = null;

    for (const [path, time] of this.cache.lastUpdated.entries()) {
      if (oldestTime === null || time < oldestTime) {
        oldestTime = time;
        oldestPath = path;
      }
    }

    if (oldestPath) {
      this.invalidate(oldestPath);
    }
  }

  /**
   * Check if a file has been modified since it was cached
   */
  private isFileModified(filePath: string, cachedTime: Date): boolean {
    try {
      const stats = statSync(filePath);
      return stats.mtime > cachedTime;
    } catch {
      // File doesn't exist or can't be accessed
      return true;
    }
  }
}

/**
 * Default cache instance
 */
let defaultCache: GitignoreCacheManager | null = null;

/**
 * Get or create the default cache instance
 */
export function getDefaultCache(options: GitignoreOptions): GitignoreCacheManager {
  if (defaultCache === null) {
    defaultCache = new GitignoreCacheManager(options);
  } else {
    defaultCache.updateOptions(options);
  }

  return defaultCache;
}

/**
 * Reset the default cache instance
 */
export function resetDefaultCache(): void {
  defaultCache = null;
}