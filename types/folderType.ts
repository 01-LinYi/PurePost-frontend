import { User } from "./postType";

export interface SavedFolder {
  id: string;
  name: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  postCount: number;
}

export interface ApiFolder {
  id: string;
  user: User;
  name: string;
  created_at: string;
  updated_at: string;
  post_count: number;
}
