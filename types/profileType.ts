// types/profileType.ts
import { User } from "@/types/userType";
export interface UserStats {
  postsCount: number;        
  publicPostsCount: number;  
  followersCount: number;   
  followingCount: number;
}

export interface UserProfile extends User {
  avatar: string;
  bio: string;
  location: string;
  website: string;
  dateOfBirth: string;       
  
  isFollowing: boolean;      
  isMe: boolean;             
  
  stats?: UserStats;         
  pinnedPost?: any;
}

// snake_cased API format
export interface ApiUserProfile {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  
  avatar: string;
  bio: string;
  location: string;
  website: string;
  date_of_birth: string;
  
  is_followed?: boolean;
  
  stats?: {
    posts_count: number;
    public_posts_count: number;
    followers_count: number;
    following_count: number;
  };
}
