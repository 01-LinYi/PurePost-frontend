import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import GradientButton from "@/components/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axiosInstance from "@/utils/axiosInstance";
import { Author } from "@/types/postType";
import { UserProfile, UserStats } from "@/types/profileType";
import useProfileCache from "@/hooks/useProfileCache";
import { formatDate } from "@/utils/dateUtils";

// Get the width of the screen for responsive design
const { width } = Dimensions.get("window");

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

// Mock data for stats section
const MOCK_STATS: UserStats = {
  posts_count: 120,
  followers_count: 114,
  following_count: 514,
};

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
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
      const response = await axiosInstance.get("/users/my-profile/");
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
        const fallbackData = {
          username: "johndoe",
          email: "johndoe@example.com",
          avatar: "https://picsum.photos/200",
          bio: "Software Developer | Tech Enthusiast | Coffee Lover",
          location: "San Francisco, CA",
          website: "https://johndoe.dev",
          date_of_birth: "2000-01-01",
          created_at: "2023-01-01T12:00:00Z",
          updated_at: "2023-02-01T12:00:00Z",
          is_active: true,
          verified: true,
          stats: MOCK_STATS,
        };

        await saveProfileToCache(fallbackData);
      }

      setDataLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Try to get data from cache even if expired
      const cachedData = await loadProfileFromCache();

      if (!cachedData) {
        // Set hardcoded fallback data if no cache
        const fallbackData = {
          username: "johndoe",
          email: "johndoe@example.com",
          bio: "Software Developer | Tech Enthusiast | Coffee Lover",
          avatar: "https://picsum.photos/200",
          location: "San Francisco, CA",
          date_of_birth: "January 1, 1990",
          website: "https://johndoe.dev",
          verified: true,
          stats: MOCK_STATS,
        };

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
   * Navigate to another screen
   * @param path Destination path
   */
  const navigateTo = (path: any) => router.push(path);

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
        navigateTo("/profile/edit");
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GradientButton
              text="Edit Profile"
              onPress={handleEditProfile}
              loading={isLoading}
              gradientColors={[COLORS.primary, COLORS.accent]}
              style={styles.mainButton}
              borderRadius={8}
            />
          </View>

          {/* User Stats Section */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/post/my_posts")}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.posts || "0"}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/profile/followers")}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.followers || "0"}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/profile/following")}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.following || "0"}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
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
            onPress={() => navigateTo("/(tabs)/setting")}
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
            onPress={() => navigateTo("/post/saved")}
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

const styles = StyleSheet.create({
  // 样式保持不变
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  cacheInfoContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 6,
    alignItems: "center",
    marginTop: 4,
  },
  cacheInfoText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: "italic",
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    margin: 12,
    padding: 16,
    paddingTop: 80,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarSection: {
    alignItems: "center",
    position: "relative",
    marginTop: -70,
  },
  avatarGradientBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  userInfo: {
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "transparent",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  username: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  email: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionButtons: {
    marginTop: 16,
    alignItems: "center",
  },
  mainButton: {
    width: "80%",
    marginVertical: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
  },
  stat: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  bioSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    margin: 12,
    marginTop: 6,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  bioItem: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  bioIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  bioTextContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  bioLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  bioValue: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
  settingsSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    margin: 12,
    marginTop: 6,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingText: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
});
