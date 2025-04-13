// utils/transformers/profileTransformers.ts
import { ApiUserProfile, UserProfile } from "@/types/profileType";
import { User } from "@/types/userType";

export const transformUserProfile = (data: ApiUserProfile): UserProfile => {
  return {
    id: data.user_id,
    username: data.username,
    email: data.email,

    isVerified: !!data.is_verified,
    isActive: !!data.is_active,
    isPrivate: !!data.is_private,

    createdAt: data.created_at,
    updatedAt: data.updated_at,

    avatar: data.avatar || "",
    bio: data.bio || "",
    location: data.location || "",
    website: data.website || "",
    dateOfBirth: data.date_of_birth || "",

    isFollowing: !!data.is_followed,
    isMe: false, // This will be set based on the context where this function is used

    // Social stats
    // Note: Currently, the API does not return these fields
    // but they are included in the UserProfile interface for consistency
    // and future use.
    stats: data.stats
      ? {
          postsCount: data.stats.posts_count,
          publicPostsCount: data.stats.public_posts_count,
          followersCount: data.stats.followers_count,
          followingCount: data.stats.following_count,
        }
      : undefined,
  };
};

export const transformUser = (data: any): User => {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    isActive: data.is_active,
    isVerified: data.is_verified,
    isPrivate: data.is_private,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
