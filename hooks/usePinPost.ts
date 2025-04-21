// hooks/usePinPost.ts
import { useState, useEffect, useCallback } from "react";
import { fetchPinnedPosts } from "@/utils/api";
import { Post, ApiPost } from "@/types/postType";
import { transformApiPostToPost } from "@/utils/transformers/postsTransformers";

interface UsePinnedPostResult {
  pinnedPost: Post | null;
  isLoading: boolean;
  error: Error | null;
  fetchData: (userId?: number) => Promise<void>;
  refetch: (userId?: number) => Promise<void>;
}

/**
 * Hook to fetch and manage pinned posts for a user
 * @param userId - The ID of the user whose pinned posts to fetch
 * @param initialFetch - Whether to fetch data on initial mount
 * @returns Object containing the pinned post, loading state, error state, and refetch function
 */
export const usePinnedPost = (
  userId: number,
  initialFetch: boolean = true
): UsePinnedPostResult => {
  const [pinnedPost, setPinnedPost] = useState<Post | null>(null);
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (id?: number) => {
      // If userId is not provided and no override id is provided, return early
      if ((!userId && userId == -1) && !id) {
        return;
      }

      const targetUserId = id ?? userId;

      try {
        setisLoading(true);
        setError(null);

        // Fetch pinned posts
        const res = await fetchPinnedPosts(targetUserId, true, false);
        const posts = res.map((post: ApiPost) => transformApiPostToPost(post));

        // Set the first pinned post or null if none exists
        setPinnedPost(posts && posts.length > 0 ? posts[0] : null);
      } catch (err) {
        console.error("Failed to fetch pinned post:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch pinned post")
        );
        setPinnedPost(null);
      } finally {
        setisLoading(false);
      }
    },
    [userId]
  );

  // Fetch data on mount if initialFetch is true
  useEffect(() => {
    if (initialFetch && userId) {
      fetchData();
    }
  }, [userId, initialFetch, fetchData]);

  const refreshPinnedPost = useCallback(
    async (id?: number) => {
      // If userId is not provided and no override id is provided, return early
      if ((!userId && userId == -1) && !id) {
        return;
      }
      const targetUserId = id ?? userId;
      try {
        setisLoading(true);
        setError(null);

        // Fetch pinned posts
        const res = await fetchPinnedPosts(targetUserId, true, true);
        const posts = res.map((post: ApiPost) => transformApiPostToPost(post));

        // Set the first pinned post or null if none exists
        setPinnedPost(posts && posts.length > 0 ? posts[0] : null);
      } catch (err) {
        console.error("Failed to fetch pinned post:", err);

        setError(
          err instanceof Error ? err : new Error("Failed to fetch pinned post")
        );
        setPinnedPost(null);
      }
      finally {
        setisLoading(false);
      }
    }
    , [userId]
  );


  // Return the pinned post, loading state, error, and refetch function
  return {
    pinnedPost,
    isLoading,
    error,
    fetchData,
    refetch: refreshPinnedPost,
  };
};
