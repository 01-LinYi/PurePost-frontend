import { useState, useEffect, useCallback } from "react";
import { Post } from "@/types/postType";
import { transformApiPostToPost } from "@/utils/transformers/postsTransformers";
import { getApi } from "@/utils/api";
import axiosInstance from "@/utils/axiosInstance";
// fetchAdminReports: Get all reports
// fetchPendingReports: Get pending reports

interface UseAdminPostsOptions {
  fetchAll?: boolean;
  forceRefresh?: boolean;
  page?: number;
  pageSize?: number;
  ordering?: string;
}

/**
 *
 * @param UseAdminPostsOptions
 * @returns posts: Post[]
 * @returns loading: boolean
 * @returns error: string | null
 * @returns refresh: () => void
 * @returns hasNextPage: boolean
 */
export const useAdminPosts = ({
  fetchAll = false,
  forceRefresh = false,
  page = 1,
  pageSize = 10,
  ordering = "-created_at",
}: UseAdminPostsOptions) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchData = useCallback(
    async (force: boolean) => {
      setLoading(true);
      setError(null);
      try {
        let currentPage = page;
        let allPosts: Post[] = [];

        do {
          const res = await getApi(
            `content/posts/admin_posts/?page=${currentPage}&page_size=${pageSize}&ordering=${ordering}`,
            {},
            {
              skipCache: false,
              cacheTtlMinutes: 60,
              forceRefresh: force || forceRefresh,
            }
          );
          const data = res.data;
          setHasNextPage(!!data.next);
          const mapped: Post[] = data.results.map(transformApiPostToPost);
          allPosts = [...allPosts, ...mapped];
          if (mapped.length < pageSize) {
            setHasNextPage(false);
            break;
          }
          if (!fetchAll || !data.next) break;
          currentPage += 1;
        } while (true);
        // const debugs = allPosts.map((post) => (post.deepfake_status));
        // console.debug("Posts in useAdminPosts:", debugs);
        setPosts(allPosts);
        setAllPosts(allPosts);
        setHasNextPage(false);
      } catch (err: any) {
        console.debug("in useAdminPosts:", err.message);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [fetchAll, forceRefresh, page, pageSize, ordering]
  );

  const filterPosts = async (option: number) => {
    await fetchData(false);
    switch (option) {
      case 0:
        break;
      case 1:
        const filteredPosts = allPosts.filter(
          (post) => post.deepfake_status === "flagged"
        );
        setPosts(filteredPosts);
        break;
      case 2:
        const filteredPosts2 = allPosts.filter(
          (post) => post.deepfake_status === "not_analyzed"
        );
        setPosts(filteredPosts2);
        break;
      default:
        break;
    }
    setError(null);
  };

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  return {
    posts,
    loading,
    error,
    hasNextPage,
    refresh: () => fetchData(true),
    filterPosts,
  };
};

export const adminDeletePost = async (postId: string) => {
  const res = await axiosInstance.delete(`/content/admin/delete-post/${postId}/`);
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  return res;
};
