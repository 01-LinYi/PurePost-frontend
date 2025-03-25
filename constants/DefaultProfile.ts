import { UserProfile, UserStats } from "@/types/profileType";

export const MOCK_STATS: UserStats = {
  posts_count: 120,
  followers_count: 114,
  following_count: 514,
};

export const DefaultProfile: UserProfile = {
    username: "johndoe",
    email: "johndoe@example.com",
    avatar: "https://picsum.photos/200",
    bio: "Software Developer | Tech Enthusiast | Coffee Lover",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    date_of_birth: "2000-01-01",
    created_at: "2023-01-01T12:00:00Z",
    updated_at: "2023-02-01T12:00:00Z",
    is_active: true,
    verified: true,
    stats: MOCK_STATS,
};