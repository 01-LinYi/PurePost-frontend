import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, SplashScreen, Tabs, router } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, View, StyleSheet, Platform } from "react-native";

import { useSession } from "@/components/SessionProvider";
import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";
import { useColorScheme } from "@/hooks/useColorScheme";

// TabBarIcon component
function TabBarIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} name={name} color={color} />;
}

// Special new post button component using Expo Router navigation
function NewPostButton({ colorScheme }: { colorScheme: "light" | "dark" }) {
  return (
    <Pressable 
      style={styles.newPostButton}
      onPress={() => router.push("/post")}
    >
      {({ pressed }) => (
        <View style={[
          styles.newPostIconContainer,
          { backgroundColor: Colors[colorScheme ?? "light"].tint },
          pressed && styles.pressed
        ]}>
          <FontAwesome
            name="plus"
            size={22}
            color="white"
          />
        </View>
      )}
    </Pressable>
  );
}

// InfoButton component for the header right
function InfoButton({ colorScheme }: { colorScheme: "light" | "dark" }) {
  return (
    <Pressable
      onPress={() => router.push("/modal")}
      style={({ pressed }) => ({
        marginRight: 15,
        opacity: pressed ? 0.5 : 1
      })}
    >
      <FontAwesome
        name="info-circle"
        size={25}
        color={Colors[colorScheme ?? "light"].text}
      />
    </Pressable>
  );
}

// Tab configuration for better maintainability
// First half of tabs (before new post button)
const TABS_FIRST_HALF = [
  {
    name: "index",
    title: "Home",
    iconName: "home" as const,
    headerRight: true,
  },
  {
    name: "profile",
    title: "Profile",
    iconName: "user" as const,
    headerShown: false,
  },
];

// Second half of tabs (after new post button)
const TABS_SECOND_HALF = [
  {
    name: "message",
    title: "Message",
    iconName: "comments" as const,
  },
  {
    name: "about",
    title: "About",
    iconName: "info-circle" as const,
  },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isSessionLoading, user, isUserLoading } = useSession();
  const loading = isSessionLoading || isUserLoading;
  
  // Handle splash screen with Expo
  useEffect(() => {
    if (loading) {
      // Keep splash screen visible
      SplashScreen.preventAutoHideAsync();
    } else {
      // Hide splash screen
      SplashScreen.hideAsync().catch(() => {
        // Silent catch for errors
      });
    }
  }, [loading]);

  // useEffect to handle navigation when session or user is not available
  useEffect(() => {
    if (!loading && (!session || !user)) {
      router.replace("/login");
    }
  }, [loading, session, user]);

  if (loading) {
    return null;
  }

  // Redirect to login if session or user is not available
  if (!session || !user) {
    return null; // 让useEffect处理导航
  }

  const activeColor = Colors[colorScheme ?? "light"].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: useClientOnlyValue(false, true),
        // Custom styles for header and tab bar
        headerStyle: {
          height: Platform.OS === 'ios' ? 90 : 70, 
        },
        headerTitleStyle: {
          fontSize: 18,
        },
        headerStatusBarHeight: Platform.OS === 'ios' ? 40 : 20, 
        tabBarStyle: { 
          paddingBottom: Platform.OS === 'ios' ? 5 : 0, 
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          paddingBottom: Platform.OS === 'ios' ? 5 : 3,
        }
      }}
    >
      {/* First half of tabs */}
      {TABS_FIRST_HALF.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <TabBarIcon name={tab.iconName} color={color} />,
            headerShown: tab.headerShown === false ? false : useClientOnlyValue(false, true),
            ...(tab.headerRight && {
              headerRight: () => (
                <InfoButton colorScheme={colorScheme ?? "light"} />
              ),
            }),
          }}
        />
      ))}

      {/* New Post Tab (in the middle) */}
      <Tabs.Screen
        name="create-post"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarButton: () => <NewPostButton colorScheme={colorScheme ?? "light"} />,
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => {
            // 阻止默认的tab导航行为
            e.preventDefault();
            // 导航到post页面
            router.push("/post");
          },
        }}
      />

      {/* Second half of tabs */}
      {TABS_SECOND_HALF.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <TabBarIcon name={tab.iconName} color={color} />,
            headerShown: tab.headerShown === false ? false : useClientOnlyValue(false, true),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  newPostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  newPostIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 5 : 5, // Push the button up more on iOS
    // Cross-platform shadow
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  }
});