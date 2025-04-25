import { useState, useEffect } from "react";
import { ReportStats } from "@/types/reportType";
import { fetchReportStat } from "@/utils/api";

/** 
  * Custom hook to fetch report statistics
  * @returns stats: `ReportStats`
  */
export const useReportStats = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchReportStat(true);
      setStats(res);
      return res;
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, error, refresh: loadStats };
};
