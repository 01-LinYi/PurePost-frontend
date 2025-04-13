import { User } from "./userType";

export interface UserStats {
  posts_count: number;
  public_posts_count?: number;
  followers_count: number;
  following_count: number;
}

export interface UserProfile extends User {
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  date_of_birth?: string;
  stats?: UserStats;
  isFollowing?: boolean;
  isMe?: boolean;
}