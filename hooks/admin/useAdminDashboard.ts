// hooks/useAdminDashboard.ts
import { useState, useEffect } from "react";
import { Post } from "@/types/postType";
import { Report } from "@/types/reportType";
import { AdminDashboardStats } from "@/hooks/admin/useAdminStats";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { useAdminReports } from "./useAdminReport";

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentContent: Post[]; // Array of recent content (posts or comments)
  pendingReports: Report[]; // Array of pending reports
  // Currently only working with posts, maybe comments later
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>; // Function to refresh the data
}

export const useAdminDashboard = (): AdminDashboardData => {
  const [recentContent, setRecentContent] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const adminStats = useAdminStats();
  const adminReports = useAdminReports({
    onlyPending: true,
    pageSize: 5,
  });

  const fetchData = async () => {
    try {
      await Promise.all([adminStats.refresh(), adminReports.refresh()]);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch dashboard data")
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    /*
    const init = async () => {
      setIsLoading(true);
      setError(null);
      // await fetchData();
      // hold for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    */
    setIsLoading(false);
  }, []);

  return {
    stats: adminStats.stats,
    pendingReports: adminReports.reports,
    recentContent,
    isLoading,
    error,
    refresh: fetchData,
  };
};
