// hooks/useAdminDashboard.ts
import { useState, useEffect } from "react";
import { Post } from "@/types/postType";
import { MOCK_REPORTS } from "@/constants/DefaultReports"; // Mock data for reports

// Define the types for the admin dashboard stats
export interface AdminDashboardStats {
  users: number; // Total number of users
  posts: number; // Total number of public
  allReportsNum: number; // Total number of reports
  pendingReportsNum: number; // Total number of pending reports
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentContent: Post[]; // Array of recent content (posts or comments)
  pendingReports: any[]; // Array of pending reports
  // Currently only working with posts, maybe comments later
  isLoading: boolean;
  error: Error | null;
}

export const useAdminDashboard = (): AdminDashboardData => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    users: 0,
    posts: 0,
    allReportsNum: 0,
    pendingReportsNum: 0,
  });
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [recentContent, setRecentContent] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate an API call
        const response = await new Promise<AdminDashboardStats>((resolve) =>
          setTimeout(
            () =>
              resolve({
                users: 100,
                posts: 50,
                allReportsNum: 10,
                pendingReportsNum: 5,
              }),
            1000
          )
        );
        setStats(response);
        setPendingReports(MOCK_REPORTS);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch stats")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { stats, pendingReports, recentContent, isLoading, error };
};
