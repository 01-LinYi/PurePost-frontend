import { useState, useEffect, useCallback } from "react";
import { Report } from "@/types/reportType";
import { transformApiReportToReport } from "@/utils/transformers/reportTransformers";
import {
  fetchAdminReports,
  fetchPendingReports,
  performReportAction,
} from "@/utils/api";
// fetchAdminReports: Get all reports
// fetchPendingReports: Get pending reports

interface UseAdminReportsOptions {
  onlyPending?: boolean; // Whether to fetch only pending reports
  fetchAll?: boolean;
  forceRefresh?: boolean;
  page?: number;
  pageSize?: number;
  ordering?: string;
}

/**
 *
 * @param UseAdminReportsOptions
 * @returns reports: Report[]
 * @returns loading: boolean
 * @returns error: string | null
 * @returns refresh: () => void
 * @returns hasNextPage: boolean
 */
export const useAdminReports = ({
  onlyPending = false,
  fetchAll = false,
  forceRefresh = false,
  page = 1,
  pageSize = 10,
  ordering = "-created_at",
}: UseAdminReportsOptions) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchData = useCallback(async (force:boolean ) => {
    setLoading(true);
    setError(null);

    try {
      if (onlyPending) {
        const data = await fetchPendingReports({
          forceRefresh: force || forceRefresh,
          page,
          pageSize,
          ordering,
        });
        if (data.next) {
          setHasNextPage(true);
        } else {
          setHasNextPage(false);
        }
        setReports(data.results.map(transformApiReportToReport));
      } else {
        // Fetch all reports
        let currentPage = page;
        let allReports: Report[] = [];

        do {
          const res = await fetchAdminReports({
            page: currentPage,
            pageSize,
            ordering,
            forceRefresh,
          });
          if (res.status === 401) {
            throw new Error("Unauthorized");
          }
          const data = res;
          setHasNextPage(!!data.next);
          if (data.results.length === 0) {
            setHasNextPage(false);
            break;
          }
          const mapped = data.results.map(transformApiReportToReport);
          allReports = [...allReports, ...mapped];

          if (!fetchAll || !data.next) break;
          currentPage += 1;
        } while (true);

        setReports(allReports);
        setHasNextPage(false);
      }
    } catch (err: any) {
      console.debug("in useAdminReports:", err.message);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [onlyPending, fetchAll, forceRefresh, page, pageSize, ordering]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  return {
    reports,
    loading,
    error,
    hasNextPage,
    refresh: () => fetchData(true),
  };
};

export const resolveReport = async (reportId: string) => {
  try {
    await performReportAction(reportId, "resolve");
    // Refresh the reports after resolving
  } catch (err: any) {
    throw new Error(err.message || "Failed to resolve report");
  }
};

export const rejectReport = async (reportId: string) => {
  try {
    await performReportAction(reportId, "reject");
  } catch (err: any) {
    throw new Error(err.message || "Failed to reject report");
  }
};