export interface User {
  id: number;
  username: string;
  email: string;
  is_verified?: boolean;
  is_active?: boolean;
  is_private?: boolean;
  // TODO: merge fields
  isActive?: boolean;
  isVerify?: boolean;
  isPrivate?: boolean;
  created_at?: string;
  updated_at?: string;
}
