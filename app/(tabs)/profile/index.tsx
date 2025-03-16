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
import { Post, Author } from "@/types/postType";
import { UserProfile, UserStats } from "@/types/profileType";

// Get the width of the screen
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

// Mock data for stats
const MOCK_STATS: UserStats = {
  posts: "120",
  followers: "350",
  following: "180",
};

// Mock user data using the Author interface
const MOCK_USER: Author = {
  id: "user123",
  name: "johndoe",
  avatar: "https://picsum.photos/200",
};

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      setDataLoading(true);

      // Fetch user profile data
      const response = await axiosInstance.get("/users/my-profile/");
      if (response.data) {
        // Combine the API response with mock stats
        setUserData({
          ...response.data,
          stats: MOCK_STATS, // Use mock stats
        });
      } else {
        // Fallback if API returns empty data
        setUserData({
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
        });
      }

      setDataLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Set fallback data on error
      setUserData({
        id: "user123",
        name: "John Doe",
        username: "johndoe",
        email: "johndoe@example.com",
        bio: "Software Developer | Tech Enthusiast | Coffee Lover",
        avatarUrl: "https://picsum.photos/200",
        location: "San Francisco, CA",
        birthday: "January 1, 1990",
        website: "https://johndoe.dev",
        verified: true,
        stats: MOCK_STATS,
      });

      Alert.alert(
        "Error",
        "Failed to load profile data. Using cached data instead."
      );
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const navigateTo = (path) => router.push(path);

  const handleEditProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigateTo("/profile/edit");
    }, 0);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  // If data is still loading, show a loading indicator
  if (dataLoading && !userData) {
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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.avatarGradientBorder}
            >
              <Image
                source={{
                  uri:
                    imageError || !userData?.avatar
                      ? "https://picsum.photos/200"
                      : userData.avatar,
                }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            </LinearGradient>
          </View>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{userData?.username || "User"}</Text>
              {userData?.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.email}>{userData?.email || ""}</Text>
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

          {/* Stats */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/post/my_posts")}
            >
              <Text style={styles.statNumber}>
                {userData?.stats?.posts || "0"}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/profile/followers")}
            >
              <Text style={styles.statNumber}>
                {userData?.stats?.followers || "0"}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/profile/following")}
            >
              <Text style={styles.statNumber}>
                {userData?.stats?.following || "0"}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About</Text>

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
                {userData?.bio || "No bio added yet"}
              </Text>
            </View>
          </View>

          {userData?.location && (
            <View style={styles.bioItem}>
              <Ionicons
                name="location-outline"
                size={22}
                color={COLORS.primary}
                style={styles.bioIcon}
              />
              <View style={styles.bioTextContainer}>
                <Text style={styles.bioLabel}>Location</Text>
                <Text style={styles.bioValue}>{userData.location}</Text>
              </View>
            </View>
          )}

          {userData?.date_of_birth && (
            <View style={styles.bioItem}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={COLORS.primary}
                style={styles.bioIcon}
              />
              <View style={styles.bioTextContainer}>
                <Text style={styles.bioLabel}>Birthday</Text>
                <Text style={styles.bioValue}>{userData.date_of_birth}</Text>
              </View>
            </View>
          )}

          {userData?.website && (
            <View style={styles.bioItem}>
              <Ionicons
                name="globe-outline"
                size={22}
                color={COLORS.primary}
                style={styles.bioIcon}
              />
              <View style={styles.bioTextContainer}>
                <Text style={styles.bioLabel}>Website</Text>
                <Text style={styles.bioValue}>{userData.website}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigateTo("/(tabs)/setting")}
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
            style={styles.settingItem}
            onPress={() => navigateTo("/post/saved")}
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
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: width / 2 - 60,
    borderRadius: 10,
    padding: 2,
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
