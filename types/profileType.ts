export interface UserStats {
  posts_count: number;
  public_posts_count?: number;
  followers_count: number;
  following_count: number;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    avatar: string;
    bio?: string;
    location?: string;
    website?: string;
    date_of_birth?: string;
    created_at?: string;
    updated_at?: string;
    isActive: boolean;
    isVerify: boolean;
    stats?: UserStats;
    isFollowing?: boolean;
    isMe?: boolean;
  }