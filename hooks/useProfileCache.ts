import { useStorageState } from "@/hooks/useStorageState";
import { useEffect, useState, useMemo, useCallback } from "react";
import { UserProfile } from "@/types/profileType";

export default function useSecureProfileCache() {
  const [profileState, setProfileState] = useStorageState("user-profile");
  const [timestampState, setTimestampState] =
    useStorageState("profile-timestamp");
  const [isLoading, profileData] = profileState;
  const [isTimestampLoading, timestamp] = timestampState;

  // Cache status management
  const [cacheStatus, setCacheStatus] = useState("loading");
  const [cacheInfo, setCacheInfo] = useState("");

  // Cache expiration time (15 minutes)
  const CACHE_EXPIRY = 15 * 60 * 1000;

  // Parse profile data with proper error handling
  const parsedProfileData = useMemo(() => {
    if (isLoading || !profileData) return null;

    try {
      const parsed = JSON.parse(profileData);
      // Fix ID field consistently
      if (parsed && parsed.user_id) {
        parsed.id = parsed.user_id;
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing profile data:", error);
      return null;
    }
  }, [isLoading, profileData]);

  // Check if cache is expired
  const isCacheExpired = useCallback(() => {
    if (!timestamp) return true;

    const now = Date.now();
    return now - parseInt(timestamp) > CACHE_EXPIRY;
  }, [timestamp, CACHE_EXPIRY]);

  // Update cache status based on current state
  useEffect(() => {
    if (isLoading || isTimestampLoading) {
      setCacheStatus("loading");
      setCacheInfo("Loading from secure storage...");
      return;
    }

    if (!parsedProfileData) {
      setCacheStatus("empty");
      setCacheInfo("No cached profile data");
      return;
    }

    if (isCacheExpired()) {
      setCacheStatus("expired");
      setCacheInfo("Cached data expired");
    } else {
      setCacheStatus("valid");
      const cacheAge = Math.round(
        (Date.now() - parseInt(timestamp || "0")) / 60000
      );
      setCacheInfo(`Using secure cached data (${cacheAge} min old)`);
    }
  }, [
    isLoading,
    isTimestampLoading,
    parsedProfileData,
    isCacheExpired,
    timestamp,
  ]);

  // Save profile to secure storage
  const saveProfileToCache = async (data: UserProfile) => {
    try {
      setProfileState(JSON.stringify(data));
      setTimestampState(Date.now().toString());
      setCacheStatus("fresh");
      setCacheInfo("Data saved to secure cache");
    } catch (error) {
      console.error("Error saving profile to secure cache:", error);
      setCacheStatus("error");
    }
  };

  // Load profile from secure storage
  const loadProfileFromCache = useCallback(async () => {
    return parsedProfileData;
  }, [parsedProfileData]);

  // Clear cache
  const clearCache = async () => {
    setProfileState(null);
    setTimestampState(null);
    setCacheStatus("empty");
    setCacheInfo("Secure cache cleared");
  };

  return {
    profileData: parsedProfileData,
    isLoading: isLoading || isTimestampLoading,
    cacheStatus,
    cacheInfo,
    saveProfileToCache,
    loadProfileFromCache,
    isCacheExpired,
    clearCache,
  };
}
