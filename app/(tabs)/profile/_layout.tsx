import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      {/* Profile page'  header */}
      <Stack.Screen
        name="index" // profile/index.tsx
        options={{
          headerShown: false,
        }}
      />

      {/* Followers page */}
      <Stack.Screen
        name="followers"
        options={{
          headerTitle: "Followers",
          headerShown: false,
        }}
      />

      {/* Following page */}
      <Stack.Screen
        name="following"
        options={{
          headerTitle: "Following",
          headerShown: false,
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
