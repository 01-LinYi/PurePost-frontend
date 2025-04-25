// types/notificationType.ts

export enum NotificationType {
    LIKE = 'like',
    COMMENT = 'comment',
    SHARE = 'share',
    REPORT = 'report',
}
  
export interface Notification {
    id: string;
    type: NotificationType;
    sender: {
      id: string;
      username: string;
      profile_picture?: string;
    };
    content: string;      
    created_at: string;
    read: boolean;
    post_id?: string;    
    comment_id?: string;
}