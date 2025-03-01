import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Redirect, SplashScreen, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { useSession } from "@/components/SessionProvider";
import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";
import { useColorScheme } from "@/hooks/useColorScheme";

// TabBarIcon 组件
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isSessionLoading } = useSession();

  if (isSessionLoading) {
    SplashScreen.preventAutoHideAsync();
    return null;
  }

  if (!session) {
    return <Redirect href={"/login"} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      {/* 主页 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      {/* Profile 页面 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />

      {/* Dashboard 页面 */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <TabBarIcon name="th-large" color={color} />,
        }}
      />

      {/* About 页面 ✅ 确保存在 */}
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => <TabBarIcon name="info" color={color} />,
        }}
      />
    </Tabs>
  );
}