import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      {/* 主页面的 header */}
      <Stack.Screen
        name="index" // 对应 profile/index.tsx
        options={{
          headerTitle: "Profile", // 只为主页面设置标题
        }}
      />

      {/* Followers 页面 */}
      <Stack.Screen
        name="followers"
        options={{
          headerTitle: "Followers", // 自定义子页面标题
        }}
      />

      {/* Following 页面 */}
      <Stack.Screen
        name="following"
        options={{
          headerTitle: "Following", // 自定义子页面标题
        }}
      />
    </Stack>
  );
}
