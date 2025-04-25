import { useEffect, useState } from "react";
import { Report } from "@/types/reportType";
import { getApi } from "@/utils/api";
import { transformApiReportToReport } from "@/utils/transformers/reportTransformers";

export const useReportDetails = (reportId: string) => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApi(`/content/reports/${reportId}/`);
      if (!res) {
        throw new Error("Failed to fetch report details");
      }
      const transformedReport = transformApiReportToReport(res.data);
      setReport(transformedReport);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);
  return { report, loading, error, refresh: fetchReportDetails };
};
