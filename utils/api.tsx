import axiosInstance from "@/utils/axiosInstance";

export const getApi = async (url: string) => {
  try {
    const response = await axiosInstance.get(url);
    return response;
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return error.response;
  }
};

/**
 * Get the profile of current user
 * @returns data = {
            'username': string,
            'email': string,
            'avatar': string,
            'bio': string,
            'location': string,
            'website': string,
            'date_of_birth': string,
            'created_at': string,
            'updated_at': string,
            'is_active': boolean,
            'verified': boolean,
        }
 */
export const fetchMyProfile = async () => {
  return getApi(`/users/my-profile/`);
};

export const fetchUserProfile = async (username: string) => {
  return getApi(`/users/profiles/${username}/`);
};

/**
 * Get the social stats of current user
 * @returns  JSON data = {
            'is_following': boolean,
            'follower_count': int,
            'following_count':int
        }
 */
export const fetchMySocialStat = async () => {
  return getApi(`/social/follow/status/`);
};

export const fetchUserSocialStat = async (user_id: number) => {
  return getApi(`/social/follow/status/${user_id}/`);
};

export const followUser = async (user_id: number) => {
  try {
    const response = await axiosInstance.post(`/social/follow/${user_id}/`);
    return response;
  } catch (error: any) {
    console.error("Error following user:", error);
    return error.response;
  }
};

export const unfollowUser = async (user_id: number) => {
  try {
    const response = await axiosInstance.post(`/social/unfollow/${user_id}/`);
    return response;
  } catch (error: any) {
    console.error("Error following user:", error);
    return error.response;
  }
};

/**
 * Get the home feed posts
 * @param page Page number for pagination
 * @param limit Number of posts per page
 * @returns List of feed posts
 */
export const fetchHomeFeed = async (page: number = 1, limit: number = 10) => {
  return getApi(`/content/posts/?page=${page}&limit=${limit}`);
};

/**
 * Get the list of posts pinned by the current user
 * @returns a list of Post
 */
export const fetchPinnedPosts = async () => {
  //TODO: Implement this function
  return {};
};

export const fetchSinglePosts = async (user_id: string) => {
  return getApi(`/content/posts/${user_id}/`);
};

export const fetchPostComments = async (post_id: number) => {
  return getApi(`/content/posts/${post_id}/interactions/comments/`);
};

export const likePost = async (post_id: number) => {
  try {
    const response = await axiosInstance.post(
      `/content/posts/${post_id}/like/`
    );
    return response;
  } catch (error: any) {
    console.error("Error liking post:", error);
    return error.response;
  }
};

export const unlikePost = async (post_id: number) => {
  try {
    const response = await axiosInstance.post(
      `/content/posts/${post_id}/unlike/`
    );
    return response;
  } catch (error: any) {
    console.error("Error unliking post:", error);
    return error.response;
  }
};

export const toggleSavePost = async (
  postId: string,
  folderId?: string
): Promise<void> => {
  try {
    await axiosInstance.post(`/content/saved-posts/toggle/`, {
      post_id: postId,
      folder_id: folderId,
    });
  } catch (error) {
    console.error("Error toggling save status:", error);
    throw error;
  }
};

export function addComment(id: string, text: string): Promise<unknown> {
  // TODO: Implement this function
  throw new Error("Function not implemented.");
}
