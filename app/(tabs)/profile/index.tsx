import { useState, useEffect } from "react";
import {
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import GradientButton from "@/components/GradientButton";
import { styles } from "@/components/profile/profileStyle";
import PinnedPostItem from "@/components/profile/PinnedPostItem";
import FollowButton from "@/components/FollowButton";

import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/dateUtils";
import * as api from "@/utils/api";

import { DefaultProfile, MOCK_STATS } from "@/constants/DefaultProfile";
import useProfileCache from "@/hooks/useProfileCache";

import { Author } from "@/types/postType";
import { UserProfile, UserStats } from "@/types/profileType";

// Color palette based on #00c5e3
const COLORS = {
  primary: "#00c5e3",
  secondary: "#34D399",
  accent: "#3B82F6",
  background: "#F9FAFB",
  cardBackground: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#4B5563",
  textLight: "#6B7280",
  divider: "#F3F4F6",
};

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
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
      setImageError(false); // Reset image error state on refresh

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
   * Handle edit profile button press
   * Shows loading state briefly before navigation
   * Passes user data to edit screen
   */
  const handleEditProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Pass current user data to edit screen
      if (profileData) {
        router.push({
          pathname: "/profile/edit",
          params: { profileData: JSON.stringify(profileData) },
        });
      } else {
        router.push("/profile/edit");
      }
    }, 0);
  };

  /**
   * Handle pull-to-refresh gesture
   * Refreshes profile data and shows loading indicator
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData(true); // Force refresh from API
    setIsRefreshing(false);
  };

  /**
   * Get avatar URL from user data handling different possible field names
   * Falls back to placeholder if no avatar or on error
   * @returns Avatar URL string
   */
  const getAvatarUrl = () => {
    if (imageError) {
      return "https://picsum.photos/200";
    }

    // Check different possible avatar field names
    if (profileData?.avatar) {
      return profileData.avatar;
    }

    return "https://picsum.photos/200";
  };

  // Show loading state while initial data is being fetched
  if (dataLoading && !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const handleFollowToggle = async () => {
    try {
      setIsFollowLoading(true);
      // TODO: API call to follow/unfollow the user
      // API call to follow/unfollow the user
      // const response = await followUserAPI(userId);
      setIsFollowing((prevState) => !prevState);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      Alert.alert("Error", "Failed to toggle follow status. Please try again.");
    }
    setIsFollowLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Cache Info - Useful for debugging, can be removed in production */}
        {cacheInfo && (
          <View style={styles.cacheInfoContainer}>
            <Text style={styles.cacheInfoText}>{cacheInfo}</Text>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar with gradient border */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.avatarGradientBorder}
            >
              <Image
                source={{ uri: getAvatarUrl() }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            </LinearGradient>
          </View>

          {/* User Info Section */}
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{profileData?.username || "User"}</Text>
              {profileData?.verified ? (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.primary}
                  style={styles.verifiedIcon}
                />
              ) : (
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color="#FFA500"
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.email}>{profileData?.email || ""}</Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Edit Profile Button */}
            <GradientButton
              text="Edit Profile"
              onPress={handleEditProfile}
              loading={isLoading}
              gradientColors={[COLORS.primary, COLORS.accent]}
              style={styles.actionButton}
              borderRadius={8}
            />

            {/* Follow Button with lock functionality */}
            {/* size = "large", "medium", "small" */}
            <FollowButton
              userId={profileData.id}
              initialFollowStatus={profileData.isFollowing}
              isLocked={
                profileData.isPrivate && !profileData.isFollowRequestSent
              }
              lockReason={
                profileData.isPrivate
                  ? "This is a private account. Send a follow request to follow this user."
                  : ""
              }
              style={styles.actionButton}
              gradientProps={{
                gradientColors: ["#00c5e3", "#0072ff"],
              }}
              // API Calls
              followUser={api.followUser}
              unfollowUser={api.unfollowUser}
              // State Update
              onFollowStatusChange={(newStatus, userId) => {
                // Update follow status in local state
                setIsFollowing(newStatus);
                // Update follow status in profile data
                profileData.isFollowing = newStatus;
              }}
            />
          </View>

          {/* User Stats Section */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.stat}
              onPress={() => router.push("/post/my_posts")}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.posts || "0"}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => router.push("/profile/followers")}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.followers || "0"}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => router.push("/profile/following")}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.following || "0"}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Posts */}
        <View style={styles.postSection}>
          <Text style={styles.sectionTitle}>Pinned Post</Text>
          <PinnedPostItem
            post={profileData?.pinnedPost}
            onSelectPost={() => {
              router.push("/post/my_posts");
            }}
          />
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About</Text>

          {/* Bio Information */}
          <View style={styles.bioItem}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={COLORS.primary}
              style={styles.bioIcon}
            />
            <View style={styles.bioTextContainer}>
              <Text style={styles.bioLabel}>Bio</Text>
              <Text style={styles.bioValue}>
                {profileData?.bio || "No bio added yet"}
              </Text>
            </View>
          </View>

          {/* Location Information */}
          {profileData?.location && (
            <View style={styles.bioItem}>
              <Ionicons
                name="location-outline"
                size={22}
                color={COLORS.primary}
                style={styles.bioIcon}
              />
              <View style={styles.bioTextContainer}>
                <Text style={styles.bioLabel}>Location</Text>
                <Text style={styles.bioValue}>{profileData.location}</Text>
              </View>
            </View>
          )}

          {/* Birthday Information - handle different field names and format date */}
          {profileData?.date_of_birth && (
            <View style={styles.bioItem}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.primary}
                style={styles.bioIcon}
              />
              <View style={styles.bioTextContainer}>
                <Text style={styles.bioLabel}>Birthday</Text>
                <Text style={styles.bioValue}>
                  {formatDate(
                    profileData?.date_of_birth || profileData?.birthday
                  )}
                </Text>
              </View>
            </View>
          )}

          {/* Website Information */}
          {profileData?.website && (
            <View style={styles.bioItem}>
              <Ionicons
                name="globe-outline"
                size={22}
                color={COLORS.primary}
                style={styles.bioIcon}
              />
              <View style={styles.bioTextContainer}>
                <Text style={styles.bioLabel}>Website</Text>
                <Text style={styles.bioValue}>{profileData.website}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/(tabs)/setting")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={COLORS.textSecondary}
            />
            <Text style={styles.settingText}>Settings</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomWidth: 0 }]}
            onPress={() => router.push("/post/saved")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={COLORS.textSecondary}
            />
            <Text style={styles.settingText}>Saved Posts</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
