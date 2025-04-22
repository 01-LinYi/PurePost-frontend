import { useCallback, useState, useEffect } from "react";
import { ReportTargetType } from "@/types/reportType";
import { reportPost } from "@/utils/api";
import { useAppCache } from "@/components/CacheProvider";
import { CacheManager } from "@/utils/cache/cacheManager";

const REPORTED_IDS_KEY = "reportedIds";
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

export default function useReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<number>>(new Set());
  const cache = useAppCache();

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
        addReportedId(Number(targetId));
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
  const cacheKey = cache.getUserCacheKey(REPORTED_IDS_KEY);

  useEffect(() => {
    const load = async () => {
      const stored = await CacheManager.get<number[]>(cacheKey);
      if (stored && Array.isArray(stored)) {
        setReportedIds(new Set(stored));
      }
      setLoading(false);
    };
    load();
  }, [cacheKey]);

  const syncToCache = async (set: Set<number>) => {
    const data = [...set];
    const expiry = Date.now() + CACHE_DURATION;
    await CacheManager.set(cacheKey, { data, expiry });
  };

  const addReportedId = async (id: number) => {
    setReportedIds((prev) => {
      if (prev.has(id)) return prev;
      const updated = new Set(prev);
      updated.add(id);
      syncToCache(updated);
      return updated;
    });
  };

  const isReported = useCallback((targetId: string, type: ReportTargetType) => {
    const id = Number(targetId);
    if (type === "post" && reportedIds.has(id)) {
      return true;
    }
    return false;
  }, []);

  return { submitReport, loading, error, success, isReported };
}
