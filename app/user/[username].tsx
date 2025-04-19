// app/user/[username].tsx
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@/components/SessionProvider";
import ProfileContainer from "@/components/profile/ProfileContainer";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function UserProfileScreen() {

  const { username, id } = useLocalSearchParams<{ username: string, id?: string }>();
  const { user } = useSession();
  const router = useRouter();
  
  const isOwnProfile = user?.username === username;
  
  const headerTitle = isOwnProfile ? "My Profile" : `${username}'s Profile`;

  useEffect(() => {
    if (user?.username === username){
      router.replace("/profile");
    }
  }, []);

  return (
    <ProfileContainer
      userId={""}
      username={username}
      userId={id}
      isOwnProfile={isOwnProfile}
      headerTitle={headerTitle}
    />
  );
}
