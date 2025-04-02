export interface BasicUserProfile {
  id: number;
  username: string;
  email: string;
}

export interface Follow {
  id: number;
  created_at: string;
  follower: number;
  folling: number;
  follower_details: BasicUserProfile;
  following_details: BasicUserProfile;
  is_active: boolean;
  updated_at: string;
}
