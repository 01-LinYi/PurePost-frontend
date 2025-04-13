// hooks/useUserPublicPosts.ts - Custom hook for handling other users' public posts

import { useState, useCallback, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Post, ApiPost } from "@/types/postType";
import {
  getApiOrdering,
  transformApiPostToPost,
} from "@/utils/transformers/postsTransformers";

interface UseUserPublicPostsProps {
  userId?: string;
}

/**
 * Custom hook to handle fetching and managing public posts of another user
 */
export const useUserPublicPosts = ({ userId }: UseUserPublicPostsProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPublicPosts, setTotalPublicPosts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string>("-createdAt");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10; // Adjust as needed

  /**
   * Fetch public posts from the API
   */
  const fetchPosts = useCallback(
    async (refreshing = false) => {
      if (!userId) {
        setPosts([]);
        setTotalPublicPosts(0);
        setHasMore(false);
        return [];
      }

      try {
        setError(null);
        const currentPage = refreshing ? 1 : page;

        const endpoint = "/content/posts/";
        const params = {
          user_id: userId,
          ordering: getApiOrdering(ordering),
          visibility: "public",
          page: currentPage,
          page_size: PAGE_SIZE,
        };

        const response = await axiosInstance.get(endpoint, { params });
        console.log("Public posts response:", response.data);
        console.log("Public posts count:", response.data.results?.length);

        let apiPosts: ApiPost[] = [];
        let count = 0;

        if (
          response.data.results &&
          response.data.next === null &&
          response.data.previous === null
        ) {
          apiPosts = response.data.results;
          count = response.data.results.length;
          setHasMore(false); // If API returns array directly, assume no pagination
        } else {
          apiPosts = response.data.results || [];
          count = response.data.count || 0;
          setHasMore(apiPosts.length === PAGE_SIZE);
        }

        const newPosts = apiPosts.map(transformApiPostToPost);

        if (refreshing) {
          setPosts(newPosts);
          setPage(2); // Reset to page 2 for next load more
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
          setPage(currentPage + 1);
        }

        setTotalPublicPosts(count);

        return newPosts;
      } catch (error) {
        console.error("Error fetching public posts:", error);
        const errorMessage =
          (error as any)?.response?.data?.detail ||
          "Failed to load user's public posts";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [ordering, userId, page]
  );

  /**
   * Get filtered posts count based on criteria
   */
  const getFilteredPostsCount = useCallback(
    (filter?: string): number => {
      if (!filter) {
        return totalPublicPosts;
      }

      return posts.filter((post) => {
        switch (filter) {
          case "with_media":
            return !!post.image || !!post.video;
          case "with_comments":
            return post.comment_count > 0;
          case "liked":
            return post.like_count > 0;
          default:
            return true;
        }
      }).length;
    },
    [posts, totalPublicPosts]
  );

  /**
   * Load initial data
   */
  const loadData = useCallback(
    async (showFullLoading = true) => {
      try {
        if (showFullLoading) {
          setIsLoading(true);
        }
        await fetchPosts(true); // true means refreshing/resetting posts
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
   * Load more posts for infinite scrolling
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isRefreshing) return;
    try {
      setIsLoading(true);
      await fetchPosts();
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPosts, hasMore, isLoading, isRefreshing]);

  /**
   * Initialize data when component mounts or user ID changes
   */
  useEffect(() => {
    setPage(1); // Reset pagination
    setPosts([]); // Clear existing posts
    if (userId) {
      loadData();
    } else {
      setPosts([]);
      setTotalPublicPosts(0);
      setHasMore(false);
    }
  }, [userId]);

  /**
   * Handle refresh triggered by pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1); // Reset pagination
    loadData(false);
  }, [loadData]);

  /**
   * Change the sort order of posts
   */
  const handleSortChange = useCallback(
    (newOrdering: string) => {
      if (ordering !== newOrdering) {
        setOrdering(newOrdering);
        setPage(1); // Reset pagination
        loadData();
      }
    },
    [ordering, loadData]
  );

  return {
    posts,
    isLoading,
    isRefreshing,
    error,
    ordering,
    totalPublicPosts,
    hasMore,
    getFilteredPostsCount,
    handleRefresh,
    handleSortChange,
    loadMore,
    loadData,
  };
};
