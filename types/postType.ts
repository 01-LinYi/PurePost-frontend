// postType.ts

export interface Author {
    id: string;
    name: string;
    avatar: string;
  }
  
  export interface Media {
    uri: string;
    type: string;
  }
  
  export interface Comment {
    id: string;
    text: string;
    author: Author;
    createdAt: string;
  }
  
  export interface Post {
    id: string;
    text: string;
    media?: Media | null;
    author: Author;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
  }