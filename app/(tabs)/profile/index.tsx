// app/profile/index.tsx
import { useState, useEffect } from "react";
import { Alert, StyleSheet, Animated } from "react-native";

import ProfileView from "@/components/profile/ProfileView";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { View } from "@/components/Themed";
import { DefaultProfile, MOCK_STATS } from "@/constants/DefaultProfile";
import useProfileCache from "@/hooks/useProfileCache";
import * as api from "@/utils/api";

export default function ProfileScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const {
    profileData,
    cacheStatus,
    cacheInfo,
    saveProfileToCache,
    loadProfileFromCache,
    isCacheExpired,
  } = useProfileCache();

  /**
   * Fetch user profile data from API
   * On success: sets user data with mock stats
   * On failure: sets fallback data and shows alert
   * @param forceRefresh Force API request bypassing cache
   */
  const fetchUserData = async (forceRefresh = false) => {
    try {
      setDataLoading(true);

      // If not forcing refresh, try to use cache first
      if (!forceRefresh) {
        const isExpired = await isCacheExpired();
        // If cache is not expired, load from cache and return
        if (!isExpired) {
          const cachedData = await loadProfileFromCache();
          if (cachedData) {
            setDataLoading(false);
            return;
          }
        }
      }

      // Fetch user profile data from API
      const response = await api.fetchMyProfile();
      if (response.data) {
        // Combine API response with mock stats if needed
        const userData = {
          ...response.data,
          stats: response.data.stats || MOCK_STATS,
        };

        // Save to cache
        await saveProfileToCache(userData);
      } else {
        // Fallback if API returns empty data
        const fallbackData = DefaultProfile;

        await saveProfileToCache(fallbackData);
      }

      setDataLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Try to get data from cache even if expired
      const cachedData = await loadProfileFromCache();

      if (!cachedData) {
        // Set hardcoded fallback data if no cache
        const fallbackData = DefaultProfile;

        await saveProfileToCache(fallbackData);
      }

      Alert.alert(
        "Error",
        "Failed to load profile data. Using cached data instead."
      );
      setDataLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Handle pull-to-refresh gesture
   * Refreshes profile data and shows loading indicator
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData(true); // Force refresh from API
    setIsRefreshing(false);
  };

  const handleFollowStatusChange = (status: boolean, userId: string) => {
    // Update follow status in local state
    setIsFollowing(status);
    // Update follow status in profile data
    if (profileData) {
      profileData.isFollowing = status;
    }
  };

  // Create a modified ProfileView that tracks scroll
  const ScrollAnimatedProfileView = ({
    scrollY,
  }: {
    scrollY: Animated.Value;
  }) => {
    // Customize the scroll event to track position
    const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false }
    );

    return (
      <ProfileView
        profileData={profileData}
        isOwnProfile={true}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onFollowStatusChange={handleFollowStatusChange}
        dataLoading={dataLoading}
        cacheInfo={cacheInfo}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      {(() => {
        const scrollY = new Animated.Value(0);
        return (
          <>
            <ProfileHeader
              title="My Profile"
              isOwnProfile={true}
              scrollY={scrollY} // Pass scroll position for parallax effect
            />
            <ScrollAnimatedProfileView scrollY={scrollY} />
          </>
        );
      })()}
    </View>
  );
}
// Styles for the ProfileScreen component

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingTop: 8, // Small padding at the top
  },
});
