// hooks/useSocialStat.ts
import { useState, useEffect, useCallback } from "react";
import * as api from "@/utils/api";

interface UseSocialStatsProps {
  userId?: string | number;
}

interface SocialStats {
  is_following: boolean;
  follower_count: number;
  following_count: number;
}

export const useSocialStats = ({ userId }: UseSocialStatsProps) => {
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSocialStats = useCallback(async () => {
    if (!userId) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response =
        userId === "me" || !userId
          ? await api.fetchMySocialStat()
          : await api.fetchUserSocialStat(Number(userId));

      const data = response.data;
      console.log("Social stats data:", data);

      setSocialStats(data);
      return data;
    } catch (err) {
      console.error("Error fetching social stats:", err);
      const errorMessage =
        (err as any)?.response?.data?.detail || "Failed to load social stats";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);


  useEffect(() => {
    if (userId) {
      fetchSocialStats();
    }
  }, [userId, fetchSocialStats]);

  return {
    socialStats,
    isLoading,
    error,
    refreshSocialStats: fetchSocialStats,
  };
};
