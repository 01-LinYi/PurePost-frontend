// @/utils/transformers/postsTransformers.ts

import { ApiPost, Post } from "@/types/postType";

/**
 * Maps frontend ordering parameters to API ordering parameters
 * @param frontendOrdering Frontend-specific ordering parameter
 * @returns Equivalent API ordering parameter
 */
export const getApiOrdering = (frontendOrdering: string): string => {
  const mapping: Record<string, string> = {
    "-createdAt": "-created_at",
    createdAt: "created_at",
    "-likesCount": "-like_count",
    "-commentsCount": "-comment_count",
  };
  return mapping[frontendOrdering] || "-created_at";
};

/**
 * Transforms a post from API format to frontend format
 * @param apiPost Post data from the API
 * @returns Transformed post data for the frontend
 */
export const transformApiPostToPost = (apiPost: ApiPost): Post => {
  return {
    id: String(apiPost.id),
    content: apiPost.content,
    image: apiPost.image,
    video: apiPost.video,
    user: {
      id: String(apiPost.user.id),
      username: apiPost.user.username,
      email: apiPost.user.email,
      bio: apiPost.user.bio || "",
      profile_picture: apiPost.user.profile_picture || "",
      is_private: apiPost.user.is_private,
    },
    created_at: apiPost.created_at,
    updated_at: apiPost.updated_at,
    like_count: apiPost.like_count,
    comment_count: apiPost.comment_count,
    share_count: apiPost.share_count,
    is_liked: apiPost.is_liked,
    is_saved: apiPost.is_saved,
    visibility: apiPost.visibility,
    disclaimer: apiPost.disclaimer,
    deepfake_status: apiPost.deepfake_status,
    status: apiPost.status,
    is_pinned: apiPost.pinned,
    caption: apiPost.caption || null,
    tags: apiPost.tags || [],
    scheduled_for: apiPost.scheduled_for || null,

    // Calculate frontend-specific fields
    isAuthor: true, // For "My Posts" page, all posts are by the current user
    isEdited: new Date(apiPost.updated_at) > new Date(apiPost.created_at),
  };
};
