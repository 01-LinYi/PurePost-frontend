import { ReportTargetType, ReasonItem } from "@/types/reportType";
export const DEFAULT_REASONS_MAP: Record<ReportTargetType, ReasonItem[]> = {
  post: [
    { key: "inappropriate", label: "Inappropriate Content" },
    { key: "deepfake", label: "Deepfake Content" },
    { key: "spam", label: "Spam" },
    { key: "harassment", label: "Harassment" },
    { key: "misinformation", label: "Misinformation" },
    { key: "copyright", label: "Copyright Violation" },
    { key: "other", label: "Other" },
  ],
  comment: [
    { key: "harassment", label: "Abuse/harassment" },
    { key: "spam", label: "Spam" },
    { key: "other", label: "Other" },
  ],
  user: [
    { key: "impersonation", label: "Impersonation" },
    { key: "malicious", label: "Malicious behavior" },
    { key: "other", label: "Other" },
  ],
};

export const DEFAULT_REPORT_STATUS_MAP: Record<string, string> = {
  pending: "Pending",
  reviewing: "Under Review",
  resolved: "Resolved",
  rejected: "Rejected",
  default: "Unknown",
};

export const MOCK_REPORTS = [
  {
    id: "1",
    reason: { key: "deepfake", label: "Deepfake Content" },
    status: "pending",
    status_display: "Pending",
    createdAt: "10m ago",
    updatedAt: "10m ago",
    additionalInfo: "",
    reporter: {
      id: "user123",
      username: "user123",
      profilePicture: "https://via.placeholder.com/40",
    },
    post: {
      id: "11",
      content: "Oh my god, this is so funny! I can't believe they made this!",
      user: {
        id: "user456",
        username: "user456",
      },
    },
  },
];

export const REPORT_TYPES = {
  inappropriate: {
    label: "Inappropriate Content",
    description: "Content containing pornography, violence, or other material violating community guidelines",
    color: "#E74C3C",
    icon: "warning"  // MaterialIcons
  },
  deepfake: {
    label: "Deepfake",
    description: "Misleading content created using AI or other manipulation technologies",
    color: "#C0392B",
    icon: "face-recognition"  // MaterialCommunityIcons
  },
  spam: {
    label: "Spam",
    description: "Repetitive posts or irrelevant commercial advertisements",
    color: "#8E44AD",
    icon: "mail"  // MaterialIcons
  },
  harassment: {
    label: "Harassment",
    description: "Personal attacks, threats, or persistent unwanted behavior toward individuals",
    color: "#D35400",
    icon: "account-alert"  // MaterialCommunityIcons
  },
  misinformation: {
    label: "Misinformation",
    description: "Deliberately inaccurate or misleading information",
    color: "#F39C12",
    icon: "info"  // MaterialIcons
  },
  copyright: {
    label: "Copyright Infringement",
    description: "Unauthorized use of copyrighted material",
    color: "#16A085",
    icon: "copyright"  // MaterialIcons
  },
  other: {
    label: "Other Issue",
    description: "Issues that don't fall into the above categories",
    color: "#3498DB",
    icon: "flag"  // MaterialIcons
  }
};