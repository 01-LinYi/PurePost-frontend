import { ApiPost, Post, User } from "./postType";
export type ReportTargetType = "post" | "comment" | "user";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "rejected";

export interface ReportTarget {
  id: string;
  type: ReportTargetType;
}
export type ReasonItem = { key: string; label: string };

/**  The raw data structure from the API */
export interface ApiReport {
  id: number;
  post: ApiPost;
  reason: string;
  reason_display: string;
  reporter: User;
  status: string;
  status_display: string;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  reason: ReasonItem;
  status: ReportStatus;
  status_display: string;
  createdAt: string;
  updatedAt: string;

  reporter: ReportUser;
  post: ReportedPostSummary;

  additionalInfo?: string | null;
}

export interface ReportUser {
  id: number | string;
  username: string;
  profilePicture: string;
}

export interface ReportedPostSummary {
  id: string;
  content: string;
  image?: string;
  user: {
    id: number | string;
    username: string;
  };
}

export interface ReportStats {
  total: number;
  by_status: {
    pending: number;
    reviewing: number;
    resolved: number;
    rejected: number;
  };
  by_reason: {
    reason: string;
    count: number;
  }[];
  trend: {
    date: string; // YYYY-MM-DD
    count: number;
  }[];
  top_reported_posts: {
    id: number;
    title: string;
    report_count: number;
  }[];
}
