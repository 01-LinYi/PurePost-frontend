import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      {/* Profile page'  header */}
      <Stack.Screen
        name="index" // profile/index.tsx
        options={{
          headerTitle: "Profile", // only for the main page
        }}
      />

      {/* Followers page */}
      <Stack.Screen
        name="followers"
        options={{
          headerTitle: "Followers", 
        }}
      />

      {/* Following page */}
      <Stack.Screen
        name="following"
        options={{
          headerTitle: "Following",
        }}
      />
      {/* Edit Profile page */}
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
