import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import GradientButton from "@/components/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Get the width of the screen
const { width } = Dimensions.get("window");

// Color palette based on #00c5e3
// Thank our designer Claude 3.7 Sonnet for the color palette !
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

  // User data
  const userData = {
    name: "John Doe",
    username: "@johndoe",
    email: "johndoe@example.com",
    bio: "Software Developer | Tech Enthusiast | Coffee Lover",
    location: "San Francisco, CA",
    birthday: "January 1, 1990",
    stats: {
      posts: "120",
      followers: "350",
      following: "180",
    },
  };

  const navigateTo = (path) => router.push(path);

  const handleEditProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigateTo("/profile/edit");
    }, 0);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
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
                  uri: imageError
                    ? "https://picsum.photos/200"
                    : "https://picsum.photos/200",
                }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            </LinearGradient>
          </View>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{userData.name}</Text>
            </View>
            <Text style={styles.username}>{userData.username}</Text>
            <Text style={styles.email}>{userData.email}</Text>
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
              onPress={() => navigateTo("/profile/posts")}
            >
              <Text style={styles.statNumber}>{userData.stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/profile/followers")}
            >
              <Text style={styles.statNumber}>{userData.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={() => navigateTo("/profile/following")}
            >
              <Text style={styles.statNumber}>{userData.stats.following}</Text>
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
              <Text style={styles.bioValue}>{userData.bio}</Text>
            </View>
          </View>

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

          <View style={styles.bioItem}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={COLORS.primary}
              style={styles.bioIcon}
            />
            <View style={styles.bioTextContainer}>
              <Text style={styles.bioLabel}>Birthday</Text>
              <Text style={styles.bioValue}>{userData.birthday}</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigateTo("/profile/posts")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activityList}
          >
            {[1, 2, 3, 4].map((item) => (
              <TouchableOpacity
                key={`activity-${item}`}
                style={styles.activityCard}
                onPress={() => navigateTo(`/posts/${item}`)}
              >
                <Image
                  source={{
                    uri: `https://picsum.photos/300/200?random=${item}`,
                  }}
                  style={styles.activityImage}
                />
                <Text style={styles.activityTitle}>Post {item}</Text>
                <Text style={styles.activityDate}>2d ago</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
