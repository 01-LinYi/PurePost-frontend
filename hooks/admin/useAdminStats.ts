// hooks/useAdminStats.ts
// handle the fetching of admin stats
import { useState, useEffect } from "react";
import { useReportStats } from "./useReportStats";
import { getApi } from "@/utils/api";

// Define the types for the admin dashboard stats
export interface AdminDashboardStats {
  users: number; // Total number of users
  posts: number; // Total number of public
  allReportsNum: number; // Total number of reports
  pendingReportsNum: number; // Total number of pending reports
}

/**
 *
 * @returns stats: `AdminDashboardStats`
 */
export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    users: 0,
    posts: 0,
    allReportsNum: 0,
    pendingReportsNum: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportStat = useReportStats();

  const loadStats = async (forceRefresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const newReport = await reportStat.refresh();

      const [usersRes, postsRes] = await Promise.all([
        getApi(
          "/auth/admin/active_count/",
          {},
          {
            skipCache: false,
            cacheTtlMinutes: 60,
            forceRefresh: forceRefresh,
          }
        ),
        getApi(
          "/content/posts/admin_count/",
          {},
          {
            skipCache: false,
            cacheTtlMinutes: 60,
            forceRefresh: forceRefresh,
          }
        ),
      ]);
      const newStats = {
        users: usersRes?.data.user_count || 0,
        posts: postsRes?.data.post_count || 0,
        allReportsNum: newReport?.total || 0, // Total number of reports
        pendingReportsNum: newReport?.by_status?.pending || 0, // Total number of pending reports
      };

      setStats(newStats);
      return newStats;
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
      return {
        users: 0,
        posts: 0,
        allReportsNum: 0,
        pendingReportsNum: 0,
      };
    }
  };

  useEffect(() => {
    loadStats(true);
  }, []);

  return { stats, loading, error, refresh: () => loadStats(true) };
};
