// components/profile/ProfileView.tsx
import { useState, useEffect } from "react";
import {
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
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

import { formatDate } from "@/utils/dateUtils";
import * as api from "@/utils/api";

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
  cacheInfo,
  scrollEventThrottle = 16,
  onScroll,
  contentContainerStyle,
}: ProfileViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

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
                onPress={() => {
                  router.push({
                    pathname: "/message",
                    params: { userId: profileData.id },
                  });
                }}
                gradientColors={[COLORS.primary, COLORS.accent]}
                style={styles.actionButton}
                borderRadius={8}
              />
            )}

            {/* Don't show follow button on own profile */}
            { !isOwnProfile ? (
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
                  if (onFollowStatusChange) {
                    onFollowStatusChange(newStatus, userId.toString());
                  }
                }}
              />
            ): (
              <FollowButton
                userId={profileData.id}
                initialFollowStatus={profileData.isFollowing}
                isLocked={true}
                lockReason={"You cannot follow yourself."}
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
            )}
          </View>

          {/* User Stats Section */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.stat}
              onPress={
                () =>
                  isOwnProfile
                    ? router.push("/post/my_posts")
                    : router.push(`/(tabs)`) //TODO : 404 Pages
              }
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.posts || "0"}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={
                () =>
                  isOwnProfile
                    ? router.push("/profile/followers")
                    : router.push("/(tabs)") // TODO : 404 Pages
                // router.push(`/profile/user/${profileData.id}/followers`)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>
                {profileData?.stats?.followers || "0"}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stat}
              onPress={
                () =>
                  isOwnProfile
                    ? router.push("/profile/following")
                    : router.push("/(tabs)") //TODO : 404 Pages
                //router.push(`/profile/user/${profileData.id}/following`)
              }
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
