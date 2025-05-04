import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CachedItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class CacheManager {
  static async set<T>(
    key: string,
    data: T,
    ttlMinutes: number = 60
  ): Promise<void> {
    const item: CachedItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };

    await AsyncStorage.setItem(key, JSON.stringify(item));
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      const item: CachedItem<T> = JSON.parse(value);

      if (Date.now() > item.expiry) {
        await this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error(`Failed to get cached item [${key}]`, error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  static async clearCache(prefix?: string): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const keysToRemove = prefix
      ? keys.filter((key) => key.startsWith(prefix))
      : keys;

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    return [...(await AsyncStorage.getAllKeys())];
  }

  /**
   * Get cache statistics including total items, total size, expired items, and categorized items.
   * **Currently** categorizes items into `api`, `user`, `media`, and `other`.
   * Previous secure storage cache stats are not included because we use different storage methods.
   * Refer to `useProfileCache.tsx`, `useStorageState.tsx` for legacy secure storage cache.
   */
  static async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    expiredItems: number;
    categories: {
      [key: string]: {
        count: number;
        size: number;
      };
    };
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      let expiredItems = 0;
      const now = Date.now();
      const categories: {
        [key: string]: {
          count: number;
          size: number;
        };
      } = {
        api: { count: 0, size: 0 },
        user: { count: 0, size: 0 },
        media: { count: 0, size: 0 },
        other: { count: 0, size: 0 },
      };

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const valueSize = value.length;
          totalSize += valueSize;

          // Categorize the cache item
          if (key.includes("api_cache")) {
            categories.api.count++;
            categories.api.size += valueSize;

            // Further categorize API cache
            if (key.includes("/content/posts")) {
              if (!categories.feed) categories.feed = { count: 0, size: 0 };
              categories.feed.count++;
              categories.feed.size += valueSize;
            } else if (key.includes("/media")) {
              if (!categories.media) categories.media = { count: 0, size: 0 };
              categories.media.count++;
              categories.media.size += valueSize;
            }
          } else if (key.includes("user_")) {
            categories.user.count++;
            categories.user.size += valueSize;
          } else {
            categories.other.count++;
            categories.other.size += valueSize;
          }

          // Check if cache item is expired
          try {
            const item = JSON.parse(value);
            if (item.expiry && now > item.expiry) {
              expiredItems++;
            }
          } catch {
            // Not a cache item with expiry, skip
          }
        }
      }

      return {
        totalItems: keys.length,
        totalSize,
        expiredItems,
        categories,
      };
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      return {
        totalItems: 0,
        totalSize: 0,
        expiredItems: 0,
        categories: {
          api: { count: 0, size: 0 },
          user: { count: 0, size: 0 },
          media: { count: 0, size: 0 },
          other: { count: 0, size: 0 },
        },
      };
    }
  }
}
