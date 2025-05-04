import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { CacheManager } from "@/utils/cache/cacheManager";
import { clearApiCache, setUserCacheKeyGenerator } from "@/utils/api";
import { useSession } from "@/components/SessionProvider";

interface CacheContextType {
  isOnline: boolean;
  clearAllCache: () => Promise<void>;
  clearUserCache: () => Promise<void>;
  clearApiCache: (urlPattern?: string) => Promise<void>;
  isCacheClearing: boolean;
  getUserCacheKey: (key: string) => string;
  getCacheStats: () => Promise<{
    totalItems: number;
    totalSize: number;
    expiredItems: number;
    categories: {
      [key: string]: {
        count: number;
        size: number;
      };
    };
  }>;
}

const CacheContext = createContext<CacheContextType>({
  isOnline: true,
  clearAllCache: async () => {},
  clearUserCache: async () => {},
  clearApiCache: async () => {},
  isCacheClearing: false,
  getUserCacheKey: (key) => key,
  getCacheStats: async () => ({
    totalItems: 0,
    totalSize: 0,
    expiredItems: 0,
    categories: {
      api: { count: 0, size: 0 },
      user: { count: 0, size: 0 },
      media: { count: 0, size: 0 },
      other: { count: 0, size: 0 },
    },
  }),
});

export const useAppCache = () => useContext(CacheContext);

export const CacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isCacheClearing, setIsCacheClearing] = useState(false);

  const { user, session } = useSession(); // 假设存在
  const userId = user?.id;

  // genereate cache key based on user ID
  const getUserCacheKey = useCallback(
    (key: string): string => {
      if (!userId) return `guest_${key}`;
      return `user_${userId}_${key}`;
    },
    [userId]
  );

  // gloabal cache key generator
  useEffect(() => {
    setUserCacheKeyGenerator(getUserCacheKey);
  }, [getUserCacheKey]);

  // watch network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // clear all cache
  const clearAllCacheHandler = useCallback(async () => {
    setIsCacheClearing(true);
    try {
      await CacheManager.clearCache();
    } catch (error) {
      console.error("Failed to clear cache:", error);
    } finally {
      setIsCacheClearing(false);
    }
  }, []);

  // clear user cache
  const clearUserCacheHandler = useCallback(async () => {
    if (!userId) return;

    setIsCacheClearing(true);
    try {
      await CacheManager.clearCache(`user_${userId}_`);
    } catch (error) {
      console.error("Failed to clear user cache:", error);
    } finally {
      setIsCacheClearing(false);
    }
  }, [userId]);

  // clear API cache
  const clearApiCacheHandler = useCallback(async (urlPattern?: string) => {
    setIsCacheClearing(true);
    try {
      await clearApiCache(urlPattern);
    } catch (error) {
      console.error("Failed to clear API cache:", error);
    } finally {
      setIsCacheClearing(false);
    }
  }, []);

  const getCacheStatsHandler = useCallback(async () => {
    return await CacheManager.getCacheStats();
  }, []);

  return (
    <CacheContext.Provider
      value={{
        isOnline,
        clearAllCache: clearAllCacheHandler,
        clearUserCache: clearUserCacheHandler,
        clearApiCache: clearApiCacheHandler,
        isCacheClearing,
        getUserCacheKey,
        getCacheStats: getCacheStatsHandler,
      }}
    >
      {!isOnline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            No internet connection. Using cached data.
          </Text>
        </View>
      )}
      {children}
    </CacheContext.Provider>
  );
};

const styles = StyleSheet.create({
  offlineBar: {
    backgroundColor: "#f8d7da",
    padding: 10,
    alignItems: "center",
    width: "100%",
    zIndex: 1000,
  },
  offlineText: {
    color: "#721c24",
    fontWeight: "500",
  },
});
