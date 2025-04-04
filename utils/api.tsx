import { Follow } from "@/types/followType";
import { ApiPost, Post } from "@/types/postType";
import { UserProfile } from "@/types/profileType";
import axiosInstance from "@/utils/axiosInstance";

export interface PaginationResponse<T> {
  prev: string | null;
  next: string | null;
  results: T[];
}

/**
 * Perform a GET request to the specified URL using axiosInstance.
 * @param url
 * @returns JSON data = {
 *              'config': {},
 *              'data': {},
 *              'headers': {},
 *              'status': number,
 *              'request': {},
 *              'statusText': string
 * }
 */
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

export const fetchPosts = async (userId: number) => {
  return getApi(`/content/posts/?user_id=${userId}`);
}

/**
 * Get the list of posts pinned by the current user
 * @returns a list of Post
 */
export const fetchPinnedPosts = async (userId: number, isPinned: boolean = false): Promise<ApiPost[]> => {
  const res = await getApi(`/content/posts/?user_id=${userId}&is_pinned=${isPinned}`);
  return res.data.results;
}

export const followUser = async (user_id: number) => {
  try {
    const response = await axiosInstance.post(`/social/follow/${user_id}/`);
    return response;
  } catch (error: any) {
    console.error("Error following user:", error);
    return error.response;
  }
};

export const fetchFollowers = async (
  user_id: number,
  cursor: string | null
): Promise<PaginationResponse<Follow>> => {
  let res = null;
  if (cursor) {
    res = await getApi(`/social/followers/${user_id}/?cursor=${cursor}`);
  } else {
    res = await getApi(`/social/followers/${user_id}/`);
  }
  return res.data;
};

export const fetchFollowings = async (
  user_id: number,
  cursor: string | null
): Promise<PaginationResponse<Follow>> => {
  let res = null;
  if (cursor) {
    res = await getApi(`/social/following/${user_id}/?cursor=${cursor}`);
  } else {
    res = await getApi(`/social/following/${user_id}/`);
  }
  return res.data;
};

export const unfollowUser = async (user_id: number) => {
  try {
    const response = await axiosInstance.delete(`/social/unfollow/${user_id}/`);
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


export const pinPost = async (post_id: number): Promise<void> => {
  try {
    await axiosInstance.post(`/content/posts/${post_id}/pin/`);
  } catch (error) {
    console.error("Error pinning post:", error);
    throw error;
  }
}

export const unpinPost = async (post_id: number): Promise<void> => {
  try {
    await axiosInstance.post(`/content/posts/${post_id}/unpin/`);
  } catch (error) {
    console.error("Error unpinning post:", error);
    throw error;
  }
}

export function addComment(id: string, text: string): Promise<any> {
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

export const resetPassword = async (email: string, password: string, code: string): Promise<string | null> => {
  try {
    await axiosInstance.put(`/auth/forget/`, {
      "email": email,
      "new_password": password,
      "code": code,
    });
    return null;
  } catch (error: any) {
    if (!error.response && error.response.status !== 400) {
      console.error("Error reseting password: ", error);
      throw error;
    }
    return error.response.data.error;
  }
}

export const sendVerificationEmail = async (): Promise<string | null> => {
  try {
    await axiosInstance.get("auth/verify/");
    return null;
  } catch (error: any) {
    if (!error.response && error.response.status !== 400) {
      console.error("Error reseting password: ", error);
      throw error;
    }
    return error.response.data.error;
  }
}

export const verifyEmailCode = async (code: string): Promise<string | null> => {
  try {
    await axiosInstance.post("auth/verify/", {
      "code": code
    })
    return null;
  } catch (error: any) {
    if (!error.response && error.response.status !== 400) {
      console.error("Error reseting password: ", error);
      throw error;
    }
    return error.response.data.error;
  }
}

export function updatePost(id: string, data: any): Promise<any> {
  try {
    return axiosInstance.patch(`/content/posts/${id}/`, data);
  } catch (error) {
    console.error("Error editing post:", error);
    throw error;
  }
}

export function deletePost(id: string): Promise<any> {
  try {
    return axiosInstance.delete(`/content/posts/${id}/`);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

export const searchProfiles = async (
  username: string
): Promise<UserProfile[]> => {
  const res = await getApi(`/users/search/?username=${username}`);
  return res.data.results;
};

export const fetchLikers = async (
  post_id: number,
  cursor: string | null
): Promise<PaginationResponse<UserProfile>> => {
  let res = null;
  if (cursor) {
    res = await getApi(
      `/content/posts/${post_id}/interactions/likes/?cursor=${cursor}`
    );
  } else {
    res = await getApi(`/content/posts/${post_id}/interactions/likes/`);
  }
  return res.data;
}

export const fetchCommenters = async (
  post_id: number,
  cursor: string | null
): Promise<PaginationResponse<UserProfile>> => {
  let res = null;
  if (cursor) {
    res = await getApi(
      `/content/posts/${post_id}/interactions/comments/?cursor=${cursor}`
    );
  } else {
    res = await getApi(`/content/posts/${post_id}/interactions/comments/`);
  }
  return res.data;
};

export const fetchSharers = async (
  post_id: number,
  cursor: string | null
): Promise<PaginationResponse<UserProfile>> => {
  let res = null;
  if (cursor) {
    res = await getApi(
      `/content/posts/${post_id}/interactions/shares/?cursor=${cursor}`
    );
  } else {
    res = await getApi(`/content/posts/${post_id}/interactions/shares/`);
  }
  return res.data;
};

/**
 * Fetch users who interacted with a post
 * @param type : 'likes', 'comments', 或 'shares'
 * @param post_id 
 * @param cursor 
 * @returns PaginationResponse<UserProfile>
 * @description This function fetches users who interacted with a post based on the interaction type (likes, comments, shares).
 * The function takes the interaction type, post ID, and an optional cursor for pagination.
 */
export const fetchInteractionUsers = async (
  type: 'likes' | 'comments' | 'shares',
  post_id: number,
  cursor: string | null = null
): Promise<PaginationResponse<UserProfile>> => {
  let res = null;
  const endpoint = `/content/posts/${post_id}/interactions/${type}/`;
  
  if (cursor) {
    res = await getApi(`${endpoint}?cursor=${cursor}`);
  } else {
    res = await getApi(endpoint);
  }
  
  return res.data;
};