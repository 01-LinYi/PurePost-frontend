// components/profile/ProfileContainer.tsx
import { useRef, useEffect } from "react";
import { Animated, StyleSheet, Alert } from "react-native";
import { View } from "@/components/Themed";
import ProfileView from "@/components/profile/ProfileView";
import AnimatedProfileHeader from "@/components/profile/ProfileHeader";
import useProfileData from "@/hooks/useProfileData";
import { useSession } from "@/components/SessionProvider";

interface ProfileContainerProps {
  userId?: string | number;
  username?: string;
  isOwnProfile: boolean;
  headerTitle: string;
}

export default function ProfileContainer({
  userId,
  username,
  isOwnProfile,
  headerTitle,
}: ProfileContainerProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useSession();

  const {
    profileData,
    isLoading,
    isRefreshing,
    error,
    cacheInfo,
    handleRefresh,
    handleFollowStatusChange,
  } = useProfileData({
    userId,
    username,
    isOwnProfile,
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );


  if (isLoading && !isRefreshing && !profileData) {
    return <View style={styles.container} />;
  }

  if (error && !profileData) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <AnimatedProfileHeader
        title={headerTitle}
        isOwnProfile={isOwnProfile}
        scrollY={scrollY}
      />

      <ProfileView
        profileData={profileData}
        isOwnProfile={isOwnProfile}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onFollowStatusChange={handleFollowStatusChange}
        dataLoading={isLoading}
        cacheInfo={cacheInfo}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingTop: 8,
  },
});
