export interface User {
  id: number;
  username: string;
  email: string;
  is_verified?: boolean;
  is_active?: boolean;
  // TODO: merge fields
  isActive?: boolean;
  isVerify?: boolean;
  created_at?: string;
  updated_at?: string;
}
