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

// The Comment interface is used to represent a comment on a post
/**
 * class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'content', 'parent', 'created_at', 'replies']
        read_only_fields = ['user', 'post', 'created_at', 'replies']
 */
export interface Comment {
  id: string;
  post_id: string; // The ID of the post to which the comment belongs
  user: Author; // The user who made the comment
  content: string;
  created_at: string;
  replies?: Comment[]; // Nested comments
  parent?: Comment | null; // Parent comment for nested comments
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
  isAuthor?: boolean; // Indicates if the current user is the author of the post       
  visibility?: "public" | "private"; 
  updatedAt?: string;   
  isEdited?: boolean;       
  savedFolderId?: string | null; 
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
}


export interface FolderRequest {
  name: string;
}