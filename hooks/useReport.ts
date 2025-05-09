import { useCallback, useState, useEffect } from "react";
import { ReportTargetType } from "@/types/reportType";
import { reportPost, fetchMyReports } from "@/utils/api";

export default function useReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<number>>(new Set());

  const submitReport = useCallback(
    async (
      targetId: string,
      reason: string,
      type: ReportTargetType,
      extraInfo?: string,
      onSuccess?: () => void
    ) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      let additionalInfo = "";
      if (reason === "other") {
        if (!extraInfo || !extraInfo.trim()) {
          throw new Error("Please enter a reason for your report.");
        }
        if (extraInfo.length > 200) {
          throw new Error("Your reason is too long.");
        }
        additionalInfo = extraInfo.trim();
      }
      try {
        let apiFn;
        switch (type) {
          case "post":
            apiFn = reportPost;
            break;
          case "comment":
            apiFn = () => {}; // Placeholder for comment report function
            break;
          case "user":
            apiFn = () => {}; // Placeholder for user report function
            break;
          default:
            throw new Error("Unsupported report type");
        }
        await apiFn(targetId, reason, additionalInfo);
        setSuccess(true);
        await updateReportedIds(true);
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        setError(err.message || "Report failed");
        throw new Error(err.message || "Report failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );
  useEffect(() => {
    const load = async () => {
      await updateReportedIds(true);
    };
    load();
  }, []);

  const updateReportedIds = async (forceRefresh?: boolean) => {
    const res = await fetchMyReports(forceRefresh);
    if (res.status !== 200) {
      setError("Failed to fetch reported posts");
      return new Set<number>();
    }
    const ids = res.data.results
      .filter((item: any) => item.status === "pending")
      .map((item: any) => item.post_id);
    const newReportedIds = new Set<number>(ids);
    setReportedIds(newReportedIds);
    return newReportedIds;
  };

  return {
    submitReport,
    loading,
    error,
    success,
    updateReportedIds,
    reportedIds,
  };
}
