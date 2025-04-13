// hooks/useMyPosts.ts - Custom hook for handling my posts data and operations

import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import axiosInstance from "@/utils/axiosInstance";
import { Post, ApiPost } from "@/types/postType";
import {
  getApiOrdering,
  transformApiPostToPost,
} from "@/utils/transformers/postsTransformers";

interface UseMyPostsProps {
  userId?: string;
}

/**
 * Custom hook to handle fetching, sorting, and managing user posts
 */
export const useMyPosts = ({ userId }: UseMyPostsProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string>("-createdAt");

  /**
   * Fetch posts from the API
   */
  const fetchPosts = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      setTotalPosts(0);
      return [];
    }

    try {
      setError(null);
      console.log("Fetching posts with user ID:", userId);

      const endpoint = "/content/posts/";
      const params = {
        user_id: userId,
        ordering: getApiOrdering(ordering),
      };

      console.log("Making request to:", endpoint, "with params:", params);
      const response = await axiosInstance.get(endpoint, { params });

      let apiPosts: ApiPost[] = [];
      let count = 0;

      if (Array.isArray(response.data)) {
        apiPosts = response.data;
        count = response.data.length;
      } else {
        apiPosts = response.data.results || [];
        count = response.data.count || apiPosts.length;
      }

      console.log(`Found ${apiPosts.length} posts out of ${count} total`);

      const newPosts = apiPosts.map(transformApiPostToPost);

      setPosts(newPosts);
      setTotalPosts(count);

      return newPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      const errorMessage =
        (error as any)?.response?.data?.detail || "Failed to load your posts";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [ordering, userId]);

  /**
   * Get post count by type/status
   */
  const getPostsCount = useCallback(
    (status?: string): number => {
      if (!status) {
        return totalPosts;
      }

      return posts.filter((post) => {
        switch (status) {
          case "public":
          case "private":
          case "friends":
            return post.visibility === status;
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
    [posts, totalPosts]
  );

  /**
   * Load data with optional loading indicator
   */
  const loadData = useCallback(
    async (showFullLoading = true) => {
      try {
        if (showFullLoading) {
          setIsLoading(true);
        }
        await fetchPosts();
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
   * Initialize data when component mounts or user ID changes
   */
  useEffect(() => {
    if (userId) {
      loadData();
    } else {
      setPosts([]);
      setTotalPosts(0);
    }
  }, [userId, loadData]);

  /**
   * Handle refresh triggered by pull-to-refresh
   */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(false);
  }, [loadData]);

  /**
   * Change the sort order of posts
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
   * Delete a post with confirmation
   */
  const deletePost = useCallback((postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await axiosInstance.delete(`/content/posts/${postId}/`);

            setPosts((currentPosts) =>
              currentPosts.filter((post) => post.id !== postId)
            );

            setTotalPosts((prevTotal) => Math.max(0, prevTotal - 1));

            Alert.alert("Success", "Post deleted successfully");
          } catch (error) {
            console.error("Error deleting post:", error);
            Alert.alert(
              "Error",
              (error as any)?.response?.data?.detail || "Failed to delete post"
            );
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, []);

  return {
    posts,
    isLoading,
    isRefreshing,
    error,
    ordering,
    totalPosts,
    getPostsCount,
    handleRefresh,
    handleSortChange,
    deletePost,
    loadData,
  };
};
