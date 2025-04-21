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
