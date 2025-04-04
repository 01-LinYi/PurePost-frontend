// postType.ts

// Visibility options for posts
export type PostVisibility = "public" | "private" | "friends";
export type PostStatus = "draft" | "published";

// Deepfake analysis status options
export type DeepfakeStatus =
  | "not_analyzed" // Content hasn't been analyzed yet
  | "analyzing" // Analysis in progress
  | "flagged" // Identified as potentially manipulated
  | "not_flagged" // Confirmed as authentic
  | "analysis_failed"; // Unable to complete analysis

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  profile_picture: string;
  is_private: boolean;
}

export interface Media {
  image?: string;
  video?: string;
  type: string;
  name?: string;
  uri?: string;
}

export interface Comment {
  id: string;
  user: User;
  post: string; // Post ID
  content: string;
  parent: string | null;
  created_at: string;
  replies: Comment[];

  isSubmitting?: boolean;
  isEdited?: boolean;
}

// Post data structure as returned from the API
export interface Post {
  id: string;
  user: User;
  content: string;
  image: string | null;
  video: string | null;
  visibility: PostVisibility;
  like_count: number;
  share_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_liked: boolean;
  is_saved: boolean;
  disclaimer: string | null;
  deepfake_status: DeepfakeStatus | null;
  status: PostStatus;
  
  // Frontend-only fields
  isAuthor?: boolean;
  isEdited?: boolean;
  savedFolderId?: string | null;
}

// Raw post data structure from the API
export interface ApiPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
  like_count: number;
  share_count: number;
  is_liked: boolean;
  is_saved: boolean;
  visibility: PostVisibility;
  disclaimer: string | null;
  deepfake_status: DeepfakeStatus | null;
  status: PostStatus;
  user: {
    id: number | string;
    username: string;
    email: string;
    bio: string;
    profile_picture: string;
    is_private: boolean;
  };
  image: string | null;
  video: string | null;
}

export interface PostCreate {
  content?: string;
  image?: File | null;
  video?: File | null;
  visibility: "public" | "private" | "followers";
  status: "draft" | "published";
  disclaimer?: string;
}

export interface SavedPost {
  id: string;
  post: Post;
  folder_name: string;
  saved_at: string;
}

export interface Folder {
  id: string;
  user: User;
  name: string;
  created_at: string;
  updated_at: string;
  post_count: number;
}

export interface PostRequest {
  content: string;
  visibility: "public" | "private";
  status: "draft" | "published";
  media?: File;
  media_id?: string;
  disclaimer?: string;
}

export interface FolderRequest {
  name: string;
}
