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
import { Post, Author} from "@/types/postType";
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


// Mock data for stats and recent posts
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

// Mock posts using the Post interface
const MOCK_RECENT_POSTS: Post[] = [
  {
    id: "post1",
    text: "Beautiful mountain drive today! The views were incredible.",
    media: {
      uri: "https://picsum.photos/300/200?random=1",
      type: "image",
    },
    author: MOCK_USER,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    likesCount: 42,
    commentsCount: 7,
    isLiked: true,
  },
  {
    id: "post2",
    text: "City skyline at sunset - always breathtaking!",
    media: {
      uri: "https://picsum.photos/300/200?random=2",
      type: "image",
    },
    author: MOCK_USER,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    likesCount: 38,
    commentsCount: 5,
    isLiked: false,
  },
  {
    id: "post3",
    text: "Perfect day at the beach. Sun, sand, and relaxation.",
    media: {
      uri: "https://picsum.photos/300/200?random=3",
      type: "image",
    },
    author: MOCK_USER,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    likesCount: 65,
    commentsCount: 12,
    isLiked: true,
  },
  {
    id: "post4",
    text: "Hiking through the forest - nature is the best therapy!",
    media: {
      uri: "https://picsum.photos/300/200?random=4",
      type: "image",
    },
    author: MOCK_USER,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    likesCount: 29,
    commentsCount: 3,
    isLiked: false,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
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

      // Use mock data for recent posts
      setRecentPosts(MOCK_RECENT_POSTS);

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
      setRecentPosts(MOCK_RECENT_POSTS);

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
              onPress={() => navigateTo("/post")}
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

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigateTo("/post")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentPosts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityList}
            >
              {recentPosts.map((post) => (
                <TouchableOpacity
                  key={`post-${post.id}`}
                  style={styles.activityCard}
                  onPress={() => navigateTo(`/post/${post.id}`)}
                >
                  <Image
                    source={{
                      uri:
                        post.media?.uri ||
                        `https://picsum.photos/300/200?random=${post.id}`,
                    }}
                    style={styles.activityImage}
                  />
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {post.text.split(" ").slice(0, 3).join(" ") +
                      (post.text.split(" ").length > 3 ? "..." : "")}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityDate}>
                      {formatTimeAgo(post.createdAt)}
                    </Text>
                    <View style={styles.activityStats}>
                      <Ionicons
                        name="heart"
                        size={10}
                        color={post.isLiked ? "#F87171" : COLORS.textLight}
                      />
                      <Text style={styles.activityStatText}>
                        {post.likesCount}
                      </Text>
                      <Ionicons
                        name="chatbubble"
                        size={10}
                        color={COLORS.textLight}
                        style={{ marginLeft: 4 }}
                      />
                      <Text style={styles.activityStatText}>
                        {post.commentsCount}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyActivity}>
              <Ionicons
                name="images-outline"
                size={40}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyText}>No recent posts</Text>
              <TouchableOpacity
                style={styles.createPostButton}
                onPress={() => navigateTo("/posts/create")}
              >
                <Text style={styles.createPostText}>Create a Post</Text>
              </TouchableOpacity>
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

// Helper function to format timestamps like "2d ago", "3h ago", etc.
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

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
  activitySection: {
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.primary,
  },
  activityList: {
    paddingVertical: 4,
  },
  activityCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activityImage: {
    width: "100%",
    height: 90,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: "500",
    padding: 8,
    paddingBottom: 2,
    color: COLORS.text,
  },
  activityDate: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  activityMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  activityStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityStatText: {
    fontSize: 10,
    marginLeft: 2,
    color: COLORS.textLight,
  },
  emptyActivity: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  createPostButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createPostText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
});
