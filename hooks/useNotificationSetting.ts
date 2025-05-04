// hooks/useNotificationSetting.ts
import { getApi } from "@/utils/api";
import { useState, useEffect, useCallback } from "react";
import { NotificationType } from "@/types/notificationType";

export function useNotificationSetting() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    like: true,
    comment: true,
    share: true,
    follow: true,
    report: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSetting = useCallback(async (refresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getApi(
        "/notifications/preferences/",
        {},
        {
          skipCache: false,
          cacheTtlMinutes: 60,
          forceRefresh: refresh,
        }
      );
      let newSettings: Record<string, boolean> = {};
      res.data.forEach((item: { notification_type: NotificationType; enabled: boolean }) => {
        newSettings[item.notification_type] = item.enabled;
      });
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));
    } catch (e: any) {
      setError(
        e.message ||
          "Failed to read notification settings. Please check your connection and try again."
      );
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadSetting(true);
  }, [loadSetting]);

  // Load data when component mounts
  useEffect(() => {
    loadSetting(false);
  }, [loadSetting]);

  return {
    settings,
    setSettings,
    isLoading,
    error,
    handleRefresh,
  };
}
