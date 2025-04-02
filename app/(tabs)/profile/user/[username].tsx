// app/profile/user/[id].tsx
import { useState, useEffect, useRef } from "react";
import { Alert, StyleSheet, View, Animated } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "expo-router"; // Add this import

import AnimatedProfileHeader from "@/components/profile/ProfileHeader";
import ProfileView from "@/components/profile/ProfileView";
import * as api from "@/utils/api";
import { DefaultProfile } from "@/constants/DefaultProfile";
import { UserProfile } from "@/types/profileType";

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams();
  const navigation = useNavigation(); // Access navigation object

  useEffect(() => {
    navigation.setOptions({ headerShown: false }); // Hide the header
  }, [navigation]);

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Create an animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch user profile data
  const fetchUserData = async (forceRefresh = false) => {
    if (!username) return;

    try {
      setDataLoading(true);

      // Call API to get user profile by ID
      const response = await api.fetchUserProfile(username as string);

      if (response.data) {
        setProfileData(response.data);
      } else {
        // Handle no data returned
        Alert.alert("Error", "Failed to load user profile.");
        setProfileData(DefaultProfile); // Use default as fallback
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user profile.");
      setProfileData(DefaultProfile); // Use default as fallback
    } finally {
      setDataLoading(false);
    }
  };

  // Load profile data on component mount or ID change
  useEffect(() => {
    fetchUserData();
  }, [username]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData(true);
    setIsRefreshing(false);
  };

  // Handle follow status change
  const handleFollowStatusChange = (
    newStatus: boolean,
    userId: string
  ): void => {
    // Update follow status in profile data
    if (profileData) {
      setProfileData({
        ...profileData,
        isFollowing: newStatus,
      });
    }
  };

  // Handle share profile
  const handleShareProfile = async () => {
    try {
      const name = profileData?.username || "this user";
      Alert.alert(
        "Share Profile",
        `Share ${name}'s profile?`);
    } catch (error) {
      Alert.alert("Error", "Failed to share profile");
    }
  };

  // Create a modified ProfileView that tracks scroll
  const ScrollAnimatedProfileView = () => {
    // Customize the scroll event to track position
    const handleScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false }
    );

    return (
      <ProfileView
        profileData={profileData}
        isOwnProfile={false}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onFollowStatusChange={handleFollowStatusChange}
        dataLoading={dataLoading}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedProfileHeader
        title={profileData?.username || "User Profile"}
        isOwnProfile={false}
        userId={username as string}
        showBackButton={true}
        onSharePress={handleShareProfile}
        scrollY={scrollY} // Pass scroll position for parallax effect
      />
      <ScrollAnimatedProfileView />
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
