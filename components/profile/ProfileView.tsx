// components/profile/ProfileView.tsx
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import GradientButton from "@/components/GradientButton";
import { styles } from "@/components/profile/ProfileStyle";
import PinnedPostItem from "@/components/profile/PinnedPostItem";
import FollowButton from "@/components/FollowButton";
import PrivacyToggle from "@/components/profile/PrivacyToggle";

import { formatDate } from "@/utils/dateUtils";
import * as api from "@/utils/api";
import { useSession } from "../SessionProvider";

// Color palette based on #00c5e3
const COLORS = {
  primary: "#00c5e3",
  primaryLight: "#b3ebf5",
  secondary: "#34D399",
  accent: "#3B82F6",
  background: "#F9FAFB",
  cardBackground: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#4B5563",
  textLight: "#6B7280",
  divider: "#F3F4F6",
};

const PLACEHOLDER_AVATAR = "https://picsum.photos/200";

type ProfileViewProps = {
  profileData: any;
  isOwnProfile: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onFollowStatusChange?: (status: boolean, userId: string) => void;
  dataLoading?: boolean;
  cacheInfo?: string;
  scrollEventThrottle?: number;
  onScroll?: (event: any) => void;
  contentContainerStyle?: any;
};

export default function ProfileView({
  profileData,
  isOwnProfile,
  isRefreshing,
  onRefresh,
  onFollowStatusChange,
  dataLoading = false,
  scrollEventThrottle = 16,
  onScroll,
  contentContainerStyle,
}: ProfileViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPrivate, setIsPrivate] = useState(profileData?.isPrivate || false);

  /**
   * Get avatar URL from user data handling different possible field names
   * Falls back to placeholder if no avatar or on error
   */
  const avatarUrl = useMemo(() => {
    return profileData?.avatar;
  }, [profileData?.avatar, imageError]);

  useEffect(() => {
    console.log("Profile data:", profileData);
    console.log("Using avatar URL:", avatarUrl);
  }, [profileData, avatarUrl]);

  /**
   * Handle edit profile button press
   * Shows loading state briefly before navigation
   */
  const handleEditProfile = useCallback(() => {
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
  }, [profileData, router]);

  /**
   * Handle visibility toggle for private/public profile
   */
  const handleToggleVisibility = useCallback(async (value: boolean) => {
    setIsPrivate(value);
    try {
      await api.updateProfileVisibility(value);
    } catch (error) {
      console.error("Failed to update profile visibility:", error);
      setIsPrivate(!value); // Revert state on failure
    }
  }, []);

  /**
   * Navigate to user posts
   */
  const navigateToPosts = useCallback(() => {
    if (!isOwnProfile && profileData?.isPrivate && !profileData?.isFollowing) {
      Alert.alert(
        "Private Account",
        "This account is private. Follow to see posts."
      );
      return;
    }
    router.push(
      `/post/my_posts?userId=${profileData.id}&username=${profileData.username}`
    );
  }, [isOwnProfile, profileData, router]);

  /**
   * Navigate to followers list
   */
  const navigateToFollowers = useCallback(() => {
    if (isOwnProfile) {
      router.push("/profile/followers");
    }
    // Future implementation for other users' followers
  }, [isOwnProfile, router]);

  /**
   * Navigate to following list
   */
  const navigateToFollowing = useCallback(() => {
    if (isOwnProfile) {
      router.push("/profile/following");
    }
    // Future implementation for other users' following
  }, [isOwnProfile, router]);

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
        contentContainerStyle={[styles.scrollContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        scrollEventThrottle={scrollEventThrottle}
        onScroll={onScroll}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar with gradient border */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.avatarGradientBorder}
            >
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                onError={() => {setImageError(true);}}
              />
            </LinearGradient>
          </View>

          {/* User Info Section */}
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{profileData?.username || "User"}</Text>
              {profileData.isVerified ? (
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

          {/* Toggle Button for Profile Visibility */}
          <PrivacyToggle 
          isPrivate={profileData?.isPrivate || isPrivate}
          isOwnProfile={isOwnProfile}
          handleToggleVisibility={handleToggleVisibility}
          COLORS={COLORS}
          />
      

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {isOwnProfile ? (
              // Edit Profile Button (only shown on own profile)
              <GradientButton
                text="Edit Profile"
                onPress={handleEditProfile}
                loading={isLoading}
                gradientColors={[COLORS.primary, COLORS.accent]}
                style={styles.actionButton}
                borderRadius={8}
              />
            ) : (
              // Message Button (only shown on other's profile)
              <GradientButton
                text="Message"
                onPress={() => router.push("/(tabs)/(message)/conversation")}
                gradientColors={[COLORS.primary, COLORS.accent]}
                style={styles.actionButton}
                borderRadius={8}
              />
            )}

            {/* Follow button with conditional rendering */}
            <FollowButton
              userId={profileData.id}
              initialFollowStatus={profileData.isFollowing}
              isLocked={
                isOwnProfile ||
                (profileData.isPrivate && !profileData.isFollowRequestSent)
              }
              lockReason={
                isOwnProfile
                  ? "You cannot follow yourself."
                  : profileData.isPrivate
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
                if (onFollowStatusChange) {
                  onFollowStatusChange(newStatus, userId.toString());
                }
              }}
            />
          </View>

          {/* User Stats Section */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.stat}
              onPress={navigateToPosts}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData.stats.posts_count || "0"}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={navigateToFollowers}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData.stats.followers_count || "0"}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={navigateToFollowing}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.following_count || "0"}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pinned Posts */}
        <View style={styles.postSection}>
          <Text style={styles.sectionTitle}>Pinned Post</Text>
          <PinnedPostItem
            post={profileData.pinned_post || []}
            onSelectPost={navigateToPosts}
            isOwnProfile={isOwnProfile}
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

        {/* Settings Options - Only show on own profile */}
        {isOwnProfile && (
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
        )}
      </ScrollView>
    </View>
  );
}
