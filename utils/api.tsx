import { Follow } from "@/types/followType";
import { ApiPost, Post } from "@/types/postType";
import { UserProfile } from "@/types/profileType";
import { LoginResponse } from "@/types/authType";
import { SavedFolder, ApiFolder } from "@/types/folderType";
import axiosInstance from "@/utils/axiosInstance";
import {
  transformUser,
  transformUserProfile,
} from "@/utils/transformers/profileTransformers";
import { isAxiosError } from "axios";
import { CacheManager } from "@/utils/cache/cacheManager";
import { FormAnswer, apiFeedback } from "@/types/feedbackType";
import { transformFeedback } from "@/utils/transformers/feedbackTransformer";

export interface PaginationResponse<T> {
  prev: string | null;
  next: string | null;
  results: T[];
}

let getUserCacheKeyFn: (key: string) => string = (key) => `guest_${key}`;

export const setUserCacheKeyGenerator = (fn: (key: string) => string) => {
  getUserCacheKeyFn = fn;
};

export const getCacheKey = (url: string, params?: any): string => {
  const queryString = params ? `_${JSON.stringify(params)}` : "";
  return getUserCacheKeyFn(`api_cache_${url}${queryString}`);
};

export const clearApiCache = async (urlPattern?: string): Promise<void> => {
  const prefix = urlPattern
    ? getUserCacheKeyFn(`api_cache_${urlPattern}`)
    : getUserCacheKeyFn("api_cache_");

  await CacheManager.clearCache(prefix);
};

/**
 * Perform a GET request to the specified URL using axiosInstance.
 * @param url
 * @param params
 * @param options
 * @param options.skipCache: `false` to save as cache
 * @param options.cacheTtlMinutes: Cache TTL in minutes
 * @param options.forceRefresh: Force refresh the cache and fetch new data
 * @description This function fetches data from the specified URL using axiosInstance.
 * @returns JSON data = {
 *              'config': {},
 *              'data': {},
 *              'headers': {},
 *              'status': number,
 *              'request': {},
 *              'statusText': string
 * }
 */
export const getApi = async (
  url: string,
  params: any = {},
  options?: {
    skipCache?: boolean;
    cacheTtlMinutes?: number;
    forceRefresh?: boolean;
  }
) => {
  const {
    skipCache = true,
    cacheTtlMinutes = 5,
    forceRefresh = false,
  } = options || {};

  try {
    const cacheKey = getCacheKey(url);

    if (forceRefresh) {
      await CacheManager.remove(cacheKey);
      console.log("Cache cleared for URL:", url);
    }

    if (!forceRefresh && !skipCache) {
      const cachedResponse = (await CacheManager.get(cacheKey)) as {
        data: any;
        headers?: Record<string, string>;
      };

      if (cachedResponse) {
        cachedResponse.headers = {
          ...cachedResponse.headers,
          "x-from-cache": "true",
        };
        console.log("Cache hit for URL:", url);
        return cachedResponse;
      }
    }

    const response = await axiosInstance.get(url, {
      params: params,
    } as any);

    if (!forceRefresh && !skipCache) {
      const cacheKey = getCacheKey(url);
      await CacheManager.set(cacheKey, response, cacheTtlMinutes);
      console.log("Cache set for URL:", url);
    }

    return response;
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return error.response;
  }
};

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post("auth/login/", {
      username: username,
      password: password,
    });
    if (response.status === 200) {
      return {
        user: transformUser(response.data.user),
        token: response.data.token,
        error: null,
      };
    } else {
      console.error("Login failed:", response);
    }
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response &&
      (error.response.status === 401 || error.response.status === 400)
    ) {
      return {
        error: "Invalid username or password.",
        token: "",
        user: null,
      };
    } else {
      console.error("Login error: ", error);
    }
  }
  return {
    error: "An error occurred while logging in.",
    token: "",
    user: null,
  };
};

export const logout = async (): Promise<string | null> => {
  try {
    // Call the logout endpoint
    const response = await axiosInstance.post("auth/logout/");
    if (response.status === 200) {
      return null;
    } else {
      console.error("Logout failed:", response);
    }
  } catch (error) {
    if (isAxiosError(error) && error.response!.status === 401) {
      return "Unauthorized";
    } else {
      console.error("Logout error:", error);
    }
  }
  return "An error occurred while logging out.";
};

export const deleteAccount = async (
  password: string
): Promise<string | null> => {
  try {
    const response = await axiosInstance.post("auth/delete-account/", {
      password: password,
    });

    if (response.status === 200 || response.status === 204) {
      return null;
    } else {
      console.error(
        `Account deletion failed with status ${response.statusText}:`,
        response
      );
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      if (error.response.status === 400) {
        return "Incorrect password";
      } else {
        console.error("Account deletion error:", error.response.data);
      }
    } else {
      console.error("Account deletion error:", error);
    }
  }
  return "An error occurred while deleting the account.";
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
  return getApi(
    `/social/follow/status/`,
    {},
    { skipCache: false, cacheTtlMinutes: 1 }
  );
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
  console.log("fetchMyProfile", res.data);
  return transformUserProfile(res.data);
};

export const fetchUserProfile = async (username: string) => {
  const res = await getApi(`/users/profiles/${username}/`);
  return transformUserProfile(res.data);
};

export const fetchUserSocialStat = async (user_id: number) => {
  return getApi(
    `/social/follow/status/${user_id}/`,
    {},
    {
      skipCache: false,
      cacheTtlMinutes: 1,
    }
  );
};

export const fetchPosts = async (userId: number) => {
  return getApi(`/content/posts/?user_id=${userId}`);
};

/**
 * Get the list of posts pinned by the current user
 * @returns a list of Post
 */
export const fetchPinnedPosts = async (
  userId: number,
  isPinned: boolean = false,
  forceFetch?: boolean
): Promise<ApiPost[]> => {
  const res = await getApi(
    `/content/posts/?user_id=${userId}&is_pinned=${isPinned}`,
    {},
    {
      skipCache: false,
      cacheTtlMinutes: 5,
      forceRefresh: forceFetch ?? false,
    }
  );
  return res.data.results;
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
    return await axiosInstance.delete(`/social/unfollow/${user_id}/`);
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

export const fetchSinglePosts = async (
  user_id: string,
  forceRefresh?: boolean
) => {
  return getApi(
    `/content/posts/${user_id}/`,
    {}, // params
    {
      skipCache: false,
      cacheTtlMinutes: 5,
      forceRefresh: forceRefresh,
    }
  );
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
};

export const unpinPost = async (post_id: number): Promise<void> => {
  try {
    await axiosInstance.post(`/content/posts/${post_id}/unpin/`);
  } catch (error) {
    console.error("Error unpinning post:", error);
    throw error;
  }
};

export function addComment(id: string, text: string): Promise<any> {
  try {
    return axiosInstance.post(`/content/posts/${id}/comment/`, {
      content: text,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

export function deleteComment(postId: string, commentId: string): Promise<any> {
  try {
    return axiosInstance.delete(`/content/posts/${postId}/delete_comment/`, {
      data: {
        comment_id: commentId,
      },
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
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
};

export const resetPassword = async (
  email: string,
  password: string,
  code: string
): Promise<string | null> => {
  try {
    await axiosInstance.put(`/auth/forget/`, {
      email: email,
      new_password: password,
      code: code,
    });
    return null;
  } catch (error: any) {
    if (!error.response && error.response.status !== 400) {
      console.error("Error reseting password: ", error);
      throw error;
    }
    return error.response.data.error;
  }
};

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
};

export const verifyEmailCode = async (code: string): Promise<string | null> => {
  try {
    await axiosInstance.post("auth/verify/", {
      code: code,
    });
    return null;
  } catch (error: any) {
    if (!error.response && error.response.status !== 400) {
      console.error("Error reseting password: ", error);
      throw error;
    }
    return error.response.data.error;
  }
};

export const updateProfileVisibility = async (
  value: boolean
): Promise<boolean> => {
  try {
    await axiosInstance.put(`auth/user-visibility/`, {
      isPrivate: value,
    });
    return true;
  } catch (error: any) {
    console.error("Error updating profile visibility:", error.response.data);
    return false;
  }
};

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
};

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
 * @param type : 'likes', 'comments', or 'shares'
 * @param post_id
 * @param cursor
 * @returns PaginationResponse<UserProfile>
 * @description This function fetches users who interacted with a post based on the interaction type (likes, comments, shares).
 * The function takes the interaction type, post ID, and an optional cursor for pagination.
 */
export const fetchInteractionUsers = async (
  type: "likes" | "comments" | "shares",
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

/**
 * Save post API calls
 */

export const fetchSavedFolders = async (
  forceRefresh: boolean = false
): Promise<ApiFolder[]> => {
  const res = await getApi(
    `/content/folders/`,
    {},
    {
      skipCache: false,
      cacheTtlMinutes: 5,
      forceRefresh: forceRefresh,
    }
  );
  return res.data.results;
};

export const createFolder = async (name: string): Promise<SavedFolder> => {
  const res = await axiosInstance.post(`/content/folders/`, {
    name: name,
  });
  return res.data;
};

export const renameFolder = async (
  folderId: string,
  name: string
): Promise<SavedFolder> => {
  const res = await axiosInstance.patch(`/content/folders/${folderId}/`, {
    name: name,
  });
  return res.data;
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  await axiosInstance.delete(`/content/folders/${folderId}/`);
};

export const fetchSavedPosts = async (
  folderId: string,
  forceRefresh: boolean = false
): Promise<{ folder: ApiFolder; posts: any[] }> => {
  const res = await getApi(
    `/content/folders/${folderId}/posts/`,
    {},
    {
      skipCache: false,
      cacheTtlMinutes: 5,
      forceRefresh: forceRefresh,
    }
  );
  console.log("fetchSavedPosts", res.data);
  return {
    folder: res.data.folder,
    posts: res.data.posts,
  };
};

/** Fallback option when toggle failed */
export const unSavePost = async (postId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/content/saved-posts/by-post/`, {
      params: {
        post_id: postId,
      },
    });
  } catch (error) {
    console.error("Error unsaving post:", error);
    throw error;
  }
};

export const reportPost = async (
  postId: string,
  reason: string,
  extraInfo?: string
): Promise<void> => {
  try {
    if (extraInfo) {
      await axiosInstance.post(`/content/reports/`, {
        post_id: postId,
        reason: "other",
        additional_info: extraInfo,
      });
    } else {
      await axiosInstance.post(`/content/reports/`, {
        post_id: postId,
        reason: reason,
      });
    }
  } catch (error: any) {
    if (isAxiosError(error) && error.response) {
      let errorMessage = "";
      if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else {
        errorMessage = "An unknown error occurred.";
      }
      throw new Error(errorMessage);
    } else {
      throw error.response;
    }
  }
};

export const fetchMyReports = async (
  forceRefresh: boolean = false
): Promise<any> => {
  try {
    const res = getApi(
      `/content/reports/my_reports/`,
      {},
      {
        skipCache: false,
        cacheTtlMinutes: 5,
        forceRefresh: forceRefresh,
      }
    );
    return res;
  } catch (error: any) {
    if (error && isAxiosError(error)) {
      console.debug("Error fetching reports:", error.response?.data);
    }
  }
};

export const fetchAdminReports = async (
  params: {
    forceRefresh?: boolean;
    page?: number;
    pageSize?: number;
    ordering?: string;
  } = {}
): Promise<any> => {
  const {
    forceRefresh = false,
    page = 1,
    pageSize = 10,
    ordering = "-created_at",
  } = params;

  try {
    const res = await getApi(
      `/content/reports/?page=${page}&page_size=${pageSize}&ordering=${ordering}`,
      {},
      {
        skipCache: false,
        cacheTtlMinutes: 5,
        forceRefresh: forceRefresh,
      }
    );
    return res.data;
  } catch (error: any) {
    if (error && isAxiosError(error)) {
      console.debug("Error fetching reports:", error.response?.data);
    }
  }
};

export const fetchPendingReports = async (
  params: {
    forceRefresh?: boolean;
    page?: number;
    pageSize?: number;
    ordering?: string;
  } = {}
): Promise<any> => {
  const {
    forceRefresh = false,
    page = 1,
    pageSize = 10,
    ordering = "-created_at",
  } = params;

  try {
    const res = await getApi(
      `/content/reports/pending/?page=${page}&page_size=${pageSize}&ordering=${ordering}`,
      {},
      {
        skipCache: false,
        cacheTtlMinutes: 5,
        forceRefresh: forceRefresh,
      }
    );
    return res.data;
  } catch (error: any) {
    if (error && isAxiosError(error)) {
      console.debug("Error fetching reports:", error.response?.data);
    }
  }
};

export const fetchReportStat = async (
  forceRefresh: boolean = false
): Promise<any> => {
  try {
    const res = await getApi(
      `/content/reports/stats/`,
      {},
      {
        skipCache: false,
        cacheTtlMinutes: 5,
        forceRefresh: forceRefresh,
      }
    );
    return res.data;
  } catch (error: any) {
    if (error && isAxiosError(error)) {
      console.debug("Error fetching reports:", error.response?.data);
    }
  }
};

export const performReportAction = async (
  reportId: string,
  action: "resolve" | "reject"
): Promise<void> => {
  if (!reportId || isNaN(Number(reportId))) {
    throw new Error("Report ID is required");
  }
  if (!["resolve", "reject"].includes(action)) {
    throw new Error("Invalid action");
  }
  try {
    switch (action) {
      case "resolve":
        await axiosInstance.post(`/content/reports/${reportId}/resolve/`);
        break;
      case "reject":
        await axiosInstance.post(`/content/reports/${reportId}/reject/`);
        break;
    }
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
};

export const fetchUserAdmin = async (): Promise<boolean> => {
  try {
    const res = await getApi(
      `/auth/admin/check/`,
      {},
      {
        skipCache: true, // Don't cache this request!
      }
    );
    const isAdmin = !!res.data.is_admin || !!res.data.is_superuser;
    return isAdmin;
  } catch (error: any) {
    if (error && isAxiosError(error)) {
      console.debug("Error fetching reports:", error.response?.data);
    }
    return false;
  }
};

// Get notifications
export const getNotifications = async (): Promise<any> => {
  try {
    const response = await getApi(
      "/notifications/",
      {},
      {
        skipCache: true, // Always get fresh notifications
        forceRefresh: true,
      }
    );

    if (response.status === 200) {
      // Transform backend data format to match frontend Notification interface
      return response.data.map((notification: any) => ({
        id: notification.id,
        type: notification.notification_type,
        sender: {
          id: extractSenderId(notification),
          username: extractUsername(notification),
          profile_picture: notification.sender_profile_picture || null,
        },
        content: notification.message,
        created_at: notification.created_at,
        read: notification.is_read,
        post_id: notification.notification_type !== 'follow' ? notification.object_id : undefined,
        comment_id:
          notification.notification_type === "comment"
            ? notification.object_id
            : undefined,
      }));
    } else {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.detail || "Failed to fetch notifications"
      );
    }
    throw error;
  }
};

// Helper functions to extract data from notification
function extractSenderId(notification: any): string {
  if (notification.content_type && notification.content_object) {
    // Try to get user ID from content object if available
    return notification.content_object.user_id || "";
  }

  // Fallback to extracting from message
  const words = notification.message.split(" ");
  // Assuming message format is usually "{username} {action} your post"
  return words[0] || "";
}

function extractUsername(notification: any): string {
  // Extract username from notification
  if (notification.sender_username) {
    return notification.sender_username;
  }
  
  // Extract from message as fallback
  const message = notification.message;
  if (notification.notification_type === 'follow') {
    // Assuming format: "Username started following you"
    return message.split(' started following')[0];
  } else if (notification.notification_type === 'like') {
    return message.split(' liked')[0];
  } else if (notification.notification_type === 'comment') {
    return message.split(' commented')[0];
  } else if (notification.notification_type === 'share') {
    return message.split(' shared')[0];
  }
  
  return '';
}

// Mark notifications as read
export const markNotificationsAsRead = async (
  notificationIds: number[]
): Promise<void> => {
  try {
    await axiosInstance.post("/notifications/mark-read/", {
      notification_ids: notificationIds,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.detail || "Failed to mark notifications as read"
      );
    }
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    // First get all unread notification IDs
    const notifications = await getNotifications();
    const unreadIds = notifications
      .filter((notification: any) => !notification.read)
      .map((notification: any) => notification.id);

    if (unreadIds.length === 0) return;

    // Then mark them all as read
    await markNotificationsAsRead(unreadIds);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete notifications
export const deleteNotifications = async (
  notificationIds: number[]
): Promise<void> => {
  try {
    await axiosInstance.post("/notifications/delete/", {
      notification_ids: notificationIds,
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.detail || "Failed to delete notifications"
      );
    }
    throw error;
  }
};

export const getAnswers = async (
  forceRefresh: boolean
): Promise<FormAnswer[]> => {
  const res = await getApi(
    `feedback/forms/`,
    {},
    {
      skipCache: false,
      cacheTtlMinutes: 5,
      forceRefresh: forceRefresh,
    }
  );
  if (res.data.results.length === 0) {
    return [];
  }
  return res.data.results.map((item: apiFeedback) => transformFeedback(item));
};

export const getSingleAnswer = async (
  formName: string,
  forceRefresh: boolean
): Promise<FormAnswer | null> => {
  const res = await getApi(
    `feedback/forms/`,
    {
      type: formName,
    },
    {
      skipCache: false,
      cacheTtlMinutes: 5,
      forceRefresh: forceRefresh,
    }
  );
  if (res.data.results.length === 0) {
    return null;
  }
  // the results should only have one item
  return transformFeedback(res.data.results[0]);
};

export const submitAnswer = async (
  formName: string,
  answer: FormAnswer,
  isFinished: boolean
) => {
  try {
    await axiosInstance.post(`feedback/forms/`, {
      feedback_type: formName,
      content: JSON.stringify(answer.content),
      is_finished: isFinished,
    });
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      let errorMessage = "";
      if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else {
        errorMessage = error.response.data;
      }
      console.debug("Error submitting answer:", errorMessage);
    }
  }
};

export const sharePost = async (
  postId: string,
): Promise<void> => {
  try {
    await axiosInstance.post(`/content/posts/${postId}/share/`);
  } catch (error) {
    console.error("Error sharing post:", error);
    throw error;
  }
}