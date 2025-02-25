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
          headerTitle: "Followers", // 自定义子页面标题
        }}
      />

      {/* Following page */}
      <Stack.Screen
        name="following"
        options={{
          headerTitle: "Following", // 自定义子页面标题
        }}
      />
    </Stack>
  );
}
