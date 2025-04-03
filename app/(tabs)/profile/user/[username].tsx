// app/profile/user/[username].tsx
import { useState, useEffect } from "react";
import { Alert, StyleSheet, Animated } from "react-native";
import { useLocalSearchParams, useNavigation} from "expo-router";

import ProfileView from "@/components/profile/ProfileView";
import AnimatedProfileHeader from "@/components/profile/ProfileHeader";
import { View } from "@/components/Themed";
import { DefaultProfile, MOCK_STATS } from "@/constants/DefaultProfile";
import { useMyPosts } from "@/hooks/useMyPosts";
import { useUserPublicPosts } from "@/hooks/useUserPublicPosts";
import { useSocialStats } from "@/hooks/useSocialStat";
import useProfileCache from "@/hooks/useProfileCache";
import { UserProfile } from "@/types/profileType";
import * as api from "@/utils/api";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams();
  const navigation = useNavigation(); // Access navigation object

  useEffect(() => {
    navigation.setOptions({ headerShown: false }); // Hide the header
  }, [navigation]);

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
  
  const {totalPublicPosts} = useUserPublicPosts({ userId: profileData?.user_id});
  
  const { socialStats, refreshSocialStats } = useSocialStats({ 
    userId: profileData?.user_id
  });

  /**
   * Fetch user profile data from API
   */
  const fetchUserData = async (forceRefresh = false) => {
    try {
      setDataLoading(true);

      if (!forceRefresh) {
        const isExpired = await isCacheExpired();
        if (!isExpired) {
          const cachedData = await loadProfileFromCache();
          if (cachedData) {
            setDataLoading(false);
            return;
          }
        }
      }

      const response = await api.fetchUserProfile(username as string);
      console.log("User Profile response:", response.data);
      if (response.data) {
        const userData = {
          ...response.data,
          isOwnProfile: false,
          stats: MOCK_STATS,
        };

        await saveProfileToCache(userData);
      } else {
        // Save default profile if API returns nothing
        const defaultUserProfile = {
          ...DefaultProfile,
          username: username as string,
          isOwnProfile: false,
          isMe: false,
        };
        await saveProfileToCache(defaultUserProfile);
      }

      setDataLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      
      const cachedData = await loadProfileFromCache();
      if (!cachedData) {
        const defaultUserProfile = {
          ...DefaultProfile,
          username: username as string,
          isOwnProfile: false,
          isMe : false,
        };
        await saveProfileToCache(defaultUserProfile);
      }

      Alert.alert(
        "Error",
        "Failed to load profile data. Using cached data instead."
      );
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  /**
   * Handle refresh action
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);

    await Promise.all([
      fetchUserData(true),
      refreshSocialStats()
    ]);
    setIsRefreshing(false);
  };

  const handleFollowStatusChange = (status: boolean, userId: string) => {
    setIsFollowing(status);
    if (profileData) {
      profileData.isFollowing = status;
    }
  };

  const ScrollAnimatedProfileView = ({
    scrollY,
  }: {
    scrollY: Animated.Value;
  }) => {
    const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false }
    );
    
    let viewProfileData = profileData;
    if (profileData) {
      const updatedStats = { ...profileData.stats };
      
      if (totalPublicPosts !== undefined) {
        updatedStats.posts_count = totalPublicPosts;
      }
      
      if (socialStats) {
        updatedStats.followers_count = socialStats.follower_count;
        updatedStats.following_count = socialStats.following_count;
        
        viewProfileData = {
          ...profileData,
          isFollowing: socialStats.is_following
        };
      }
      
      viewProfileData = {
        ...viewProfileData,
        stats: updatedStats
      };
    }

    return (
      <ProfileView
        profileData={viewProfileData}
        isOwnProfile={false}
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
            <AnimatedProfileHeader
              title={username as string || "Profile"}
              isOwnProfile={false}
              scrollY={scrollY}
            />
            <ScrollAnimatedProfileView scrollY={scrollY} />
          </>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingTop: 8, // Small padding at the top
  },
});
