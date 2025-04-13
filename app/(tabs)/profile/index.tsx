// app/(tabs)/profile/index.tsx
import ProfileContainer from "@/components/profile/ProfileContainer";
import { useEffect } from "react";
import { useSession } from "@/components/SessionProvider";
import { Alert } from "react-native";

export default function ProfileScreen() {
  const isOwnProfile = true; // Always true for this screen
  const { user } = useSession();

  useEffect(() => {
    if (isOwnProfile && user && !user.isVerified) {
      Alert.alert("Verify Your Email", "Please verify your email in settings.");
    }
  }, [isOwnProfile, user?.isVerified]);

  return (
    <ProfileContainer
      userId="me"
      isOwnProfile={isOwnProfile}
      headerTitle="My Profile"
    />
  );
}
