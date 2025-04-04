import { UserProfile } from "@/types/profileType";

/**
 * Convert backend response to UserProfile type
 * @param data backend response of UserProfile. Typically in sanke_case
 * @returns UserProfile object, which is in camelCase
 */
export const transformUserProfile = (data: any): UserProfile => {
  return {
    id: data.user_id,
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
