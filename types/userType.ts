export interface User {
  id: number;
  username: string;
  email: string;
  isActive?: boolean;
  isVerify?: boolean;
  isPrivate?: boolean;
  created_at?: string;
  updated_at?: string;
}
