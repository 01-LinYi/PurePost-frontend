import { Follow } from "@/types/followType";
import { Post } from "@/types/postType";
import { UserProfile } from "@/types/profileType";
import axiosInstance from "@/utils/axiosInstance";
import { transformUserProfile } from "./transformer";

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
            'isVerify': boolean,
        }
 */
export const fetchMyProfile = async () => {
  const res = await getApi(`/users/my-profile/`);
  return transformUserProfile(res.data);
};

export const fetchUserProfile = async (username: string) => {
  const res = await getApi(`/users/profiles/${username}/`);
  return transformUserProfile(res.data);
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

export const fetchPosts = async (userId: number) => {
  return getApi(`/content/posts/?user_id=${userId}`);
}

/**
 * Get the list of posts pinned by the current user
 * @returns a list of Post
 */
export const fetchPinnedPosts = async (userId: number, isPinned: boolean = false): Promise<Post[]> => {
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

export const fetchFollowers = async (user_id: number, cursor: string | null): Promise<PaginationResponse<Follow>> => {
  let res = null;
  if (cursor) {
    res = await getApi(`/social/followers/${user_id}/?cursor=${cursor}`);
  } else {
    res = await getApi(`/social/followers/${user_id}/`);
  }
  return res.data;
}

export const fetchFollowings = async (user_id: number, cursor: string | null): Promise<PaginationResponse<Follow>> => {
  let res = null;
  if (cursor) {
    res = await getApi(`/social/following/${user_id}/?cursor=${cursor}`);
  } else {
    res = await getApi(`/social/following/${user_id}/`);
  }
  return res.data;
}


export const unfollowUser = async (user_id: number) => {
  try {
    return await axiosInstance.delete(`/social/unfollow/${user_id}/`);
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

export const searchProfiles = async (username: string): Promise<UserProfile[]> => {
  const res = await getApi(`/users/search/?username=${username}`);
  return res.data.results;
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
export const updateProfileVisibility = async (value: boolean): Promise<boolean> => {
  try {
    await axiosInstance.put(`auth/user-visibility/`, {
      isPrivate: value,
    });
    return true;
  } catch (error: any) {
    console.error("Error updating profile visibility:", error.response.data);
    return false;
  }
}
