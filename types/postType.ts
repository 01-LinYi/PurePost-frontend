// postType.ts

export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface Media {
  uri: string;
  name: string;
  type: string; // "image/jpeg", "image/png", "video/mp4" 
}

export interface Comment {
  id: string;
  text: string;
  author: Author;
  createdAt: string;
  isSubmitting?: boolean;
  updatedAt?: string;
  isEdited?: boolean;
}

export interface Post {
  id: string;
  text: string;
  media?: Media | null;
  author: Author;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  shareCount?: number;
  isLiked: boolean;
  isSaved?: boolean;        
  isAuthor?: boolean;       
  visibility?: "public" | "private"; 
  updatedAt?: string;   
  isEdited?: boolean;       
  savedFolderId?: string | null; 
  disclaimer?: string;
}


export interface SavedPost {
  id: string;             
  post: Post;             
  folderId: string | null; 
  createdAt: string;     
}


export interface Folder {
  id: string;
  name: string;
  postCount: number;
  createdAt: string;
  updatedAt?: string;
}


export interface ApiResponse<T> {
  results: T;    
}


export interface AddCommentRequest {
  text: string;
}


export interface SavePostRequest {
  post_id: string;
  folder_id?: string | null;
}


export interface PostRequest {
  content: string;
  visibility: "public" | "private";
  media?: File;  
  media_id?: string;
  disclaimer?: string;
}


export interface FolderRequest {
  name: string;
}