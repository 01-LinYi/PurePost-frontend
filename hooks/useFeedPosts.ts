// hooks/useFeedPosts.ts - Optimized with caching system
import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import axiosInstance from "@/utils/axiosInstance";
import {
  Post,
  ApiPost,
  DeepfakeStatus,
  AnalysisStatus,
} from "@/types/postType";
import {
  getApiOrdering,
  transformApiPostToPost,
} from "@/utils/transformers/postsTransformers";
import { performOptimisticUpdate } from "@/utils/optimiticeUP";
import { useAppCache } from "@/components/CacheProvider";
import { CacheManager } from "@/utils/cache/cacheManager";
import { getApi } from "@/utils/api";

interface UseFeedPostsProps {
  limit?: number;
  initialPage?: number;
}

/**
 * Custom hook to handle fetching, sorting, and managing feed posts
 * with integrated caching and offline support
 */
export const useFeedPosts = ({
  limit = 10,
  initialPage = 1,
}: UseFeedPostsProps = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string>("-createdAt");
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Get cache and network utilities
  const { isOnline, getUserCacheKey } = useAppCache();

  /**
   * Fetch feed posts from the API with caching
   */
  const fetchPosts = useCallback(
    async (
      pageNum: number = 1,
      replace: boolean = true,
      forceRefresh: boolean
    ) => {
      try {
        setError(null);
        console.log(`Fetching feed posts, page ${pageNum}, limit ${limit}`);

        const endpoint = "/content/posts/";
        const params = {
          page: pageNum,
          limit,
          ordering: getApiOrdering(ordering),
          ...filters,
        };
        console.log("Force refresh:", forceRefresh);

        console.log("Feed Page params:", params);

        // Use cached API with options
        const response = await getApi(endpoint, params, {
          cacheTtlMinutes: 5, // 5 minute cache for feed
          skipCache: false, // Always use cache unless refreshing
          forceRefresh: forceRefresh, // Force refresh (skip) if refreshing
        });

        let apiPosts: ApiPost[] = [];
        let count = 0;

        if (Array.isArray(response.data)) {
          apiPosts = response.data;
          count = response.data.length;
          setHasMore(false); // If API returns an array, assume no pagination
        } else {
          apiPosts = response.data.results || [];
          count = response.data.count || 0;
          setHasMore(apiPosts.length === limit && count > pageNum * limit);
        }

        console.log(
          `Found ${apiPosts.length} feed posts out of ${count} total`
        );

        const newPosts = apiPosts.map(transformApiPostToPost);

        // Check if posts came from cache
        const isFromCache = response.headers["x-from-cache"] === "true";
        if (isFromCache && !isOnline) {
          // Maybe show a subtle indicator that content is from cache
          console.log("Displaying cached feed posts in offline mode");
        }

        if (replace) {
          setPosts(newPosts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }

        setTotalPosts(count);
        setPage(pageNum);

        return newPosts;
      } catch (error) {
        console.error("Error fetching feed posts:", error);

        // If offline and no cached data, show specific message
        if (!isOnline) {
          setError("You're offline. Unable to load feed posts.");
        } else {
          const errorMessage =
            (error as any)?.response?.data?.detail ||
            "Failed to load feed posts";
          setError(errorMessage);
        }

        throw new Error((error as Error).message || "Error fetching posts");
      }
    },
    [ordering, limit, filters, isOnline, getUserCacheKey]
  );

  /**
   * Get post count by category
   */
  const getPostsCountByType = useCallback(
    (type?: string): number => {
      if (!type) {
        return totalPosts;
      }

      return posts.filter((post) => {
        switch (type) {
          case "trending":
            return post.like_count > 10 || post.comment_count > 5;
          case "new":
            // Assuming posts created within the last 24 hours are "new"
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            return new Date(post.created_at) > oneDayAgo;
          case "with_media":
            return !!post.image || !!post.video;
          case "with_disclaimer":
            return !!post.disclaimer;
          default:
            return true;
        }
      }).length;
    },
    [posts, totalPosts]
  );

  /**
   * Load initial data with optional loading indicator
   */
  const loadData = useCallback(
    async (showFullLoading = true, forceRefresh = false) => {
      try {
        if (showFullLoading) {
          setIsLoading(true);
        }
        await fetchPosts(1, true, forceRefresh);
      } catch (error) {
        console.error("Load data error:", error);
        setError((error as Error).message || "Failed to load data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchPosts]
  );

  /**
   * Load more posts (pagination) with offline awareness
   */
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore || !isOnline) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      await fetchPosts(nextPage, false, true);
    } catch (error) {
      console.error("Load more error:", error);
      // Don't set the main error state to avoid disrupting the UI
      Alert.alert("Error", "Failed to load more posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchPosts, page, isLoadingMore, hasMore, isOnline]);

  /**
   * Initialize data when component mounts
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handle refresh triggered by pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(false, true);
  }, [loadData]);

  /**
   * Change the sort order of feed posts
   */
  const handleSortChange = useCallback(
    (newOrdering: string) => {
      if (ordering !== newOrdering) {
        setOrdering(newOrdering);
        loadData();
      }
    },
    [ordering, loadData]
  );

  /**
   * Apply filters to the feed
   */
  const applyFilters = useCallback(
    (newFilters: Record<string, any>) => {
      setFilters(newFilters);
      loadData();
    },
    [loadData]
  );

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({});
    loadData();
  }, [loadData]);

  /**
   * Handle saving/unsaving a post
   */
  const handleSave = useCallback(
    async (postId: string, folderId?: string) => {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return;

      const post = posts[postIndex];
      const newIsSaved = !post.is_saved;

      const result = await performOptimisticUpdate({
        updateUI: () => {
          setPosts((currentPosts) =>
            currentPosts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    is_saved: newIsSaved,
                    savedFolderId: newIsSaved ? folderId || null : null,
                  }
                : p
            )
          );
        },
        apiCall: async () =>
          newIsSaved
            ? axiosInstance.post(`/content/posts/${postId}/save/`, {
                folder_id: folderId,
              })
            : axiosInstance.delete(`/content/posts/${postId}/save/`),
        rollbackUI: () => {
          setPosts((currentPosts) =>
            currentPosts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    is_saved: !newIsSaved,
                    savedFolderId: !newIsSaved
                      ? post.savedFolderId || null
                      : null,
                  }
                : p
            )
          );
        },
        errorMessagePrefix: `Failed to ${
          newIsSaved ? "save" : "unsave"
        } post: `,
      });

      return result;
    },
    [posts]
  );

  const reportPost = useCallback((postId: string, reason: string) => {
    Alert.alert("Report Post", "Are you sure you want to report this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            // await axiosInstance.post(`/content/posts/${postId}/report/`, {
            //   reason,
            // });
            Alert.alert("Success", "Post reported successfully");
          } catch (error) {
            console.error("Error reporting post:", error);
            Alert.alert(
              "Error",
              (error as any)?.response?.data?.detail || "Failed to report post"
            );
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, []);

  /**
   * Hide a post from feed
   */
  const hidePost = useCallback((postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId)
    );
    setTotalPosts((prevTotal) => Math.max(0, prevTotal - 1));

    // Optional: Inform the backend about this hidden post
    //axiosInstance.post(`/content/posts/${postId}/hide/`).catch((error) => {
    //  console.error("Failed to record hidden post:", error);
    //});
  }, []);

  /**
   * Handle like/unlike action for a post with offline support
   */
  const handleLike = useCallback(
    async (postId: string) => {
      // Find the post in our current state
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return;

      const post = posts[postIndex];
      const newIsLiked = !post.is_liked;

      // If offline, queue the action for later
      if (!isOnline) {
        // Update UI immediately
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_liked: newIsLiked,
                  like_count: p.like_count + (newIsLiked ? 1 : -1),
                  pendingSync: true, // Mark as pending sync
                }
              : p
          )
        );

        return { success: true, offline: true };
      }

      // Online flow - use optimistic update as before
      const result = await performOptimisticUpdate({
        updateUI: () => {
          setPosts((currentPosts) =>
            currentPosts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    is_liked: newIsLiked,
                    like_count: p.like_count + (newIsLiked ? 1 : -1),
                  }
                : p
            )
          );
        },
        apiCall: async () =>
          newIsLiked
            ? axiosInstance.post(`/content/posts/${postId}/like/`)
            : axiosInstance.post(`/content/posts/${postId}/unlike/`),
        rollbackUI: () => {
          setPosts((currentPosts) =>
            currentPosts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    is_liked: !newIsLiked,
                    like_count: p.like_count + (newIsLiked ? -1 : 1),
                  }
                : p
            )
          );
        },
        errorMessagePrefix: `Failed to ${
          newIsLiked ? "like" : "unlike"
        } post: `,
      });

      return result;
    },
    [posts, isOnline]
  );

  /**
   * Handle deepfake detection request for a post with caching
   */
  const handleDeepfakeDetection = useCallback(
    async (postId: string) => {
      try {
        const postIndex = posts.findIndex((p) => p.id === postId);
        if (postIndex === -1) return false;

        // Check if analysis is already in progress
        const post = posts[postIndex];
        if (post.deepfake_status === "analyzing") {
          Alert.alert(
            "Analysis in Progress",
            "This content is already being analyzed. Please wait for the results."
          );
          return false;
        }

        // Update UI to show detection in progress
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  deepfake_status: "analyzing",
                }
              : p
          )
        );

        // Generate cache key for this analysis
        const analysisCacheKey = getUserCacheKey(`deepfake_analysis_${postId}`);

        // Try to get result from cache first
        const cachedAnalysis = (await CacheManager.get(analysisCacheKey)) as {
          status: AnalysisStatus;
          is_deepfake: boolean;
          deepfake_score: number;
        } | null;
        if (cachedAnalysis) {
          console.log("Using cached deepfake analysis result");
          updatePostWithAnalysisResult(
            postId,
            cachedAnalysis.status,
            cachedAnalysis.is_deepfake ? "flagged" : "not_flagged",
            cachedAnalysis.deepfake_score
          );
          return true;
        }

        // If offline with no cache, show message
        if (!isOnline) {
          Alert.alert(
            "Offline Mode",
            "Deepfake detection requires an internet connection. Please try again when online."
          );

          // Reset the UI state
          setPosts((currentPosts) =>
            currentPosts.map((p) =>
              p.id === postId ? { ...p, deepfake_status: "not_analyzed" } : p
            )
          );

          return false;
        }

        console.log(`Requesting deepfake detection for post ${postId}`);

        // Call the API to initiate or get image analysis
        try {
          // First check if analysis already exists
          const existingAnalysis = await axiosInstance.get(
            `/deepfake/posts/${postId}/analysis/`
          );
          console.log("Existing analysis found");

          // Cache the result (valid for 24 hours)
          await CacheManager.set(analysisCacheKey, existingAnalysis.data, 1440);

          // Update post with the analysis result
          // {'status': 'completed',
          // 'is_deepfake': True,
          // 'deepfake_score': 0.8481758236885071,
          // 'processing_time': 0.22883200645446777,
          // 'model_processing_time': 0.06609988212585449}

          // If we get here, analysis already exists
          updatePostWithAnalysisResult(
            postId,
            existingAnalysis.data.status,
            existingAnalysis.data.is_deepfake ? "flagged" : "not_flagged",
            existingAnalysis.data.deepfake_score
          );
          return existingAnalysis.data.status !== "analysis_failed";
        } catch (error) {
          // Analysis doesn't exist yet or couldn't be retrieved
          if ((error as any)?.response?.status === 404) {
            console.log(
              "No existing analysis found, creating new analysis request"
            );

            // Create new analysis request
            const response = await axiosInstance.post(
              `/deepfake/posts/${postId}/analysis/`
            );

            // Cache initial result
            await CacheManager.set(analysisCacheKey, response.data, 1440);

            // Update post with the analysis status
            updatePostWithAnalysisResult(
              postId,
              response.data.status,
              response.data.is_deepfake ? "flagged" : "not_flagged",
              response.data.deepfake_score
            );
            return response.data.status !== "analysis_failed";
          } else {
            // Some other error occurred during GET request
            throw error;
          }
        }
      } catch (error) {
        console.error("Deepfake detection error:", error);

        // Reset the status on error
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === postId ? { ...p, deepfake_status: "analysis_failed" } : p
          )
        );

        Alert.alert(
          "Detection Failed",
          "Unable to complete deepfake detection. Please try again later."
        );
        return false;
      }
    },
    [posts, isOnline, getUserCacheKey]
  );

  /**
   * Update post with analysis result and show appropriate alert
   */
  const updatePostWithAnalysisResult = (
    postId: string,
    proc_status: AnalysisStatus,
    status: DeepfakeStatus,
    score: number
  ) => {
    // Update the post with the analysis result
    setPosts((currentPosts) =>
      currentPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              deepfake_status: status,
            }
          : p
      )
    );
    switch (proc_status) {
      case "pending":
        Alert.alert("Analysis Pending", "Your content is being analyzed.");
        break;
      case "processing":
        Alert.alert("Analysis in Progress", "Your content is being analyzed.");
        break;
      case "completed":
        Alert.alert(
          "Analysis Completed",
          `Your content has been analyzed. Result: ${
            status === "flagged" ? "Potentially manipulated" : "Authentic"
          }`
        );
        break;
      case "failed":
        Alert.alert(
          "Analysis Failed",
          "Unable to complete analysis. Please try again later."
        );
        break;
      default:
        Alert.alert("Unknown Status", "Unable to determine analysis status.");
        break;
    }
    // Optionally, you can also update the score in the post
  };

  // Share post functionality
  const handleShare = useCallback(
    async (postId: string) => {
      try {
        const postIndex = posts.findIndex((p) => p.id === postId);
        if (postIndex === -1) return false;

        // Call the API to record the share
        await axiosInstance.post(`/content/posts/${postId}/share/`);

        // Update the share count
        setPosts((currentPosts) =>
          currentPosts.map((p) =>
            p.id === postId ? { ...p, share_count: p.share_count + 1 } : p
          )
        );

        return true;
      } catch (error) {
        console.error("Share post error:", error);
        return false;
      }
    },
    [posts]
  );

  return {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    ordering,
    totalPosts,
    page,
    hasMore,
    filters,
    getPostsCountByType,
    handleRefresh,
    handleSortChange,
    loadMorePosts,
    applyFilters,
    resetFilters,
    reportPost,
    hidePost,
    loadData,
    handleLike,
    handleSave,
    handleDeepfakeDetection,
    handleShare,
    isOffline: !isOnline,
  };
};
