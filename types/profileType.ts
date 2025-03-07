export interface UserStats {
  posts: string | number;
  followers: string | number;
  following: string | number;
}

export interface UserProfile {
    username: string;
    email: string;
    avatar: string;
    bio?: string;
    location?: string;
    website?: string;
    date_of_birth?: string;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    verified?: boolean;
    stats?: UserStats;
  }