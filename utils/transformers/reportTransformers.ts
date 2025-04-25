import {
  ApiReport,
  Report,
  ReportStatus,
  ReportUser,
  ReportedPostSummary,
} from "@/types/reportType";
import { transformApiPostToPost } from "@/utils/transformers/postsTransformers";
import {
  DEFAULT_REPORT_STATUS_MAP,
  DEFAULT_REASONS_MAP,
} from "@/constants/DefaultReport";

export const transformApiReportToReport = (apiReport: ApiReport): Report => {
  const transformedPost = transformApiPostToPost(apiReport.post);
  return {
    id: apiReport.id,
    reason: DEFAULT_REASONS_MAP.post.find(
      (reason) => reason.key === apiReport.reason
    ) || { key: "unknown", label: "Unknown" },
    status: apiReport.status as ReportStatus,
    status_display: DEFAULT_REPORT_STATUS_MAP[apiReport.status] || "Unknown",
    createdAt: apiReport.created_at,
    updatedAt: apiReport.updated_at,
    additionalInfo: apiReport.additional_info,

    reporter: {
      id: apiReport.reporter.id,
      username: apiReport.reporter.username,
      profilePicture: apiReport.reporter.profile_picture || "",
    } as ReportUser,
    post: {
      id: transformedPost.id,
      content: transformedPost.content,
      user: {
        id: transformedPost.user.id,
        username: transformedPost.user.username,
      },
      image: transformedPost.image,
    } as ReportedPostSummary,
  };
};
