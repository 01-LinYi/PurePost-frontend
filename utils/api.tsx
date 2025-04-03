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
 * Get the post counts of given user id
 * If user is current user, will return the post counts of all posts
 * If user is not current user, will return the post counts of public posts
 * @param user_id
 * @returns number of posts
 */
export const fetchPostCounts = async (user_id: number) => {
  //TODO: Implement this function
  return 0;
};

/**
 * Get the list of posts pinned by the current user
 * @returns a list of Post
 */
export const fetchPinnedPosts = async () => {
  //TODO: Implement this function
  return {};
};

export const followUser = async (user_id: number) => {
  try {
    const response = await axiosInstance.post(`/auth/follow/${user_id}/`);
    return response;
  } catch (error: any) {
    console.error("Error following user:", error);
    return error.response;
  }
};

export const unfollowUser = async (user_id: number) => {
  try {
    const response = await axiosInstance.post(`/auth/unfollow/${user_id}/`);
    return response;
  } catch (error: any) {
    console.error("Error following user:", error);
    return error.response;
  }
};

export const fetchSinglePosts = async (user_id: string) => {
  return getApi(`/content/posts/${user_id}/`);
};

export const fetchPostComments = async (post_id: number) => {
  //TODO: Implement this function
  return getApi(`/content/posts/${post_id}/comments/`);
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

export const forgetPassword = async (email: string): Promise<boolean> => {
  try {
    await axiosInstance.post(`/auth/forget/?email=${email}`);
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return false;
    } else {
      console.error("Error sending resetting password email: ", error);
      throw error;
    }
  }
  return true;
}

export const resetPassword = async (email: string, password: string, code: string): Promise<string | undefined> => {
  try {
    const res = await axiosInstance.put(`/auth/forget/`, {
      "email": email,
      "new_password": password,
      "code": code,
    });
    return undefined;
  } catch (error: any) {
    if (!error.response && error.response.status !== 400) {
      console.error("Error reseting password: ", error);
      throw error;
    }
    return error.response.data.error;
  }
}
