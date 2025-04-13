import { UserProfile } from "@/types/profileType";
import { User } from "@/types/userType";

/**
 * Convert backend response to UserProfile type
 * @param data backend response of UserProfile. Typically in sanke_case
 * @returns UserProfile object, which is in camelCase
 */
export const transformUserProfile = (data: any): UserProfile => {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    avatar: data.avatar,
    bio: data.bio,
    location: data.location,
    website: data.website,
    date_of_birth: data.date_of_birth,
    created_at: data.created_at,
    updated_at: data.updated_at,
    isActive: data.is_active,
    isVerify: data.is_verified,
    isPrivate: data.is_private,
    stats: data.stats
      ? {
        posts_count: data.stats.posts_count,
        public_posts_count: data.stats.public_posts_count,
        followers_count: data.stats.followers_count,
        following_count: data.stats.following_count,
      }
      : undefined, // Handle cases where stats might be missing
    isFollowing: data.is_followed, // Transform snake_case to camelCase
  };
};

export const transformUser = (data: any): User => {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    isActive: data.is_active,
    isVerify: data.is_verified,
    isPrivate: data.is_private,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
