// hooks/useProfileData.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import useSecureProfileCache from "@/hooks/useProfileCache";
import { useSocialStats } from "@/hooks/useSocialStat";
import { useMyPosts } from "@/hooks/useMyPosts";
import { usePinnedPost } from "@/hooks/usePinPost";
import * as api from "@/utils/api";

interface UseProfileDataProps {
  userId?: string | number;
  username?: string;
  isOwnProfile: boolean;
}

export function useProfileData({
  userId,
  username,
  isOwnProfile,
}: UseProfileDataProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve the actual userId based on available information
  const effectiveUserId = useMemo(() => {
    if (isOwnProfile) return "me";
    return userId || username;
  }, [isOwnProfile, userId, username]);

  // Cache management
  const {
    profileData: cachedProfile,
    isLoading: cacheLoading,
    cacheStatus,
    cacheInfo,
    saveProfileToCache,
    loadProfileFromCache,
    isCacheExpired,
    clearCache,
  } = useSecureProfileCache();

  // Social stats data
  const {
    socialStats,
    isLoading: socialStatsLoading,
    error: socialStatsError,
    refreshSocialStats,
  } = useSocialStats({
    userId: effectiveUserId,
  });

  // Posts and other related data
  const {
    totalPosts,
    isLoading: postsLoading,
    handleRefresh: refreshPosts,
  } = useMyPosts({
    userId: cachedProfile?.user_id || cachedProfile?.id,
  });

  const {
    pinnedPost,
    isLoading: pinnedPostLoading,
    refetch: refreshPinnedPost,
  } = usePinnedPost(cachedProfile?.user_id || cachedProfile?.id, false);

  /**
   * Fetch user profile data from API
   */
  const fetchUserData = useCallback(
    async (forceRefresh = false) => {
      try {
        setDataLoading(true);
        setError(null);

        // Check cache first unless force refresh is requested
        if (!forceRefresh) {
          const isExpired = await isCacheExpired();
          if (!isExpired) {
            const cachedData = await loadProfileFromCache();
            if (cachedData) {
              setDataLoading(false);
              return cachedData;
            }
          }
        }

        // Fetch fresh data
        let response;
        if (isOwnProfile) {
          response = await api.fetchMyProfile();
        } else if (username) {
          response = await api.fetchUserProfile(username);
        } else if (userId && userId !== "me") {
          // Assuming you have a method to fetch by user ID
          throw new Error("Fetching by user ID is not implemented");
        } else {
          throw new Error("Invalid user identifier");
        }

        if (response) {
          // Save to cache
          await saveProfileToCache(response);
          return response;
        }

        throw new Error("Failed to fetch profile data");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError((error as Error).message || "Failed to load profile");

        // Try to fallback to cache on error
        const cachedData = await loadProfileFromCache();
        return cachedData;
      } finally {
        setDataLoading(false);
      }
    },
    [
      isOwnProfile,
      userId,
      username,
      isCacheExpired,
      loadProfileFromCache,
      saveProfileToCache,
    ]
  );

  /**
   * Initialize data loading
   */
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /**
   * Handle refresh action - refresh all data sources
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      await Promise.all([
        fetchUserData(true),
        refreshSocialStats(),
        refreshPosts?.(),
        refreshPinnedPost?.(cachedProfile?.user_id as number),
      ]);
    } catch (err) {
      setError((err as Error).message || "Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  }, [
    fetchUserData,
    refreshSocialStats,
    refreshPosts,
    refreshPinnedPost,
    cachedProfile?.user_id,
  ]);

  /**
   * Handle follow/unfollow action
   */
  const handleFollowStatusChange = useCallback(
    async (status: boolean) => {
      if (!cachedProfile) return;

      try {
        // Update local state immediately for UI responsiveness
        const updatedProfile = {
          ...cachedProfile,
          isFollowing: status,
        };

        // Save to cache
        await saveProfileToCache(updatedProfile);

        // Refresh social stats to get accurate counts
        await refreshSocialStats();
      } catch (err) {
        console.error("Error updating follow status:", err);
        setError("Failed to update follow status");

        // Revert on error
        await fetchUserData(true);
      }
    },
    [cachedProfile, saveProfileToCache, refreshSocialStats, fetchUserData]
  );

  /**
   * Combine all data sources into a complete profile object
   */
  const completeProfileData = useMemo(() => {
    if (!cachedProfile) return null;

    // Start with cached profile
    const baseProfile = { ...cachedProfile };

    // Update stats with latest information
    const updatedStats = { ...baseProfile.stats };

    // Update post count if available
    if (totalPosts !== undefined) {
      updatedStats.posts_count = totalPosts;
    }

    // Update social stats if available
    if (socialStats) {
      updatedStats.followers_count = socialStats.follower_count;
      updatedStats.following_count = socialStats.following_count;

      // Update following status for other users' profiles
      if (!isOwnProfile) {
        baseProfile.isFollowing = socialStats.is_following;
      }
    }

    // Add pinned post if available
    if (pinnedPost) {
      baseProfile.pinned_post = pinnedPost;
    }

    // Return the complete profile
    return {
      ...baseProfile,
      stats: updatedStats,
    };
  }, [cachedProfile, totalPosts, socialStats, pinnedPost, isOwnProfile]);

  // Determine overall loading state
  const isLoading =
    cacheLoading ||
    dataLoading ||
    socialStatsLoading ||
    postsLoading ||
    pinnedPostLoading;

  return {
    profileData: completeProfileData,
    isLoading,
    isRefreshing,
    error: error || socialStatsError,
    cacheInfo,
    cacheStatus,
    handleRefresh,
    handleFollowStatusChange,
    clearCache,
  };
}

export default useProfileData;
