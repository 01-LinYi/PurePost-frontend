import { UserProfile, UserStats } from "@/types/profileType";

export const MOCK_STATS: UserStats = {
  publicPostsCount: 100,
  postsCount: 120,
  followersCount: 114,
  followingCount: 514,
};

export const DefaultProfile: UserProfile = {
  id: 0,
  username: "johndoe",
  email: "johndoe@example.com",
  avatar: "https://picsum.photos/200",
  bio: "Software Developer | Tech Enthusiast | Coffee Lover",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  dateOfBirth: "2000-01-01",
  createdAt: "2023-01-01T12:00:00Z",
  updatedAt: "2023-02-01T12:00:00Z",
  isActive: true,
  isVerified: true,
  stats: MOCK_STATS,
  isFollowing: false,
  isMe: false,
  isPrivate: false,
};
