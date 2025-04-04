import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SplashScreen, Tabs, router } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, View, StyleSheet, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useSession } from "@/components/SessionProvider";
import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";
import { useColorScheme } from "@/hooks/useColorScheme";

// Enhanced TabBarIcon component with improved animation
function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      <FontAwesome
        size={focused ? 24 : 22} // Smaller size difference for subtlety
        style={{
          marginBottom: 2,
          transform: [{ scale: focused ? 1.05 : 1 }], // More subtle scale
          opacity: focused ? 1 : 0.85,
        }}
        name={name}
        color={color}
      />
    </View>
  );
}

// Enhanced new post button with animation and elegant gradient
function NewPostButton({ colorScheme }: { colorScheme: "light" | "dark" }) {
  // Animation reference for press feedback
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  // Handle press-in animation
  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.9,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Handle press-out animation
  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: animatedValue }],
  };

  // Refined gradient colors based on the primary theme color #00c5e3
  let gradientColors: [string, string, ...string[]];
  if (colorScheme === "dark") {
    gradientColors = ["#007991", "#00c5e3", "#78ffd6"]; // Cyan to mint gradient for dark mode
  } else {
    gradientColors = ["#0083B0", "#00c5e3"]; // Deep cyan to vibrant cyan for light mode
  }

  return (
    <Pressable
      style={styles.newPostButton}
      onPress={() => router.push("/post")}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.newPostContainer, animatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          style={styles.newPostIconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FontAwesome name="plus" size={24} color="white" />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// Info button component for header
function InfoButton({ colorScheme }: { colorScheme: "light" | "dark" }) {
  return (
    <Pressable
      onPress={() => router.push("/modal")}
      style={({ pressed }) => ({
        marginRight: 15,
        opacity: pressed ? 0.5 : 1,
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

// Tab configuration with optimized icons based on specific functionality
const TABS_FIRST_HALF = [
  {
    name: "index",
    title: "Feed",
    iconName: "newspaper-o" as const, // Best represents content/information feed
    headerShown: false,
  },
  {
    name: "(message)",
    title: "Messages",
    iconName: "envelope" as const, // Standard icon for private messaging
    headerShown: false,
  },
];

// Second half of tabs (after new post button)
const TABS_SECOND_HALF = [
  {
    name: "profile",
    title: "Profile",
    iconName: "user" as const, // Clean representation of personal profile
    headerShown: false,
  },
  {
    name: "setting",
    title: "Settings",
    iconName: "cog" as const, // Universal symbol for settings
    headerShown: false,
  },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isSessionLoading, user, isUserLoading } = useSession();
  const loading = isSessionLoading || isUserLoading;

  // Handle splash screen visibility
  useEffect(() => {
    if (loading) {
      SplashScreen.preventAutoHideAsync();
    } else {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [loading]);

  // Handle navigation when session/user is not available
  useEffect(() => {
    if (!loading && (!session || !user)) {
      router.replace("/login");
    }
  }, [loading, session, user]);

  if (loading) {
    return null;
  }

  if (!session || !user) {
    return null;
  }

  // Get color scheme-specific values
  const isDark = colorScheme === "dark";

  // Enhanced colors based on primary theme color #00c5e3
  const activeColor = isDark ? "#4fd1e9" : "#00c5e3";
  // Lighter cyan in dark mode, standard cyan in light mode
  const inactiveColor = isDark ? "#94a3b8" : "#64748b";
  // Slate gray in both modes
  const backgroundColor = isDark ? "#0f172a" : "#ffffff";
  // Deep navy blue in dark mode, white in light mode
  const borderColor = isDark ? "#1e293b" : "#f1f5f9";
  // Darker navy in dark mode, very light blue-gray in light mode

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: useClientOnlyValue(false, true),
        // Custom styling for header and tab bar
        headerStyle: {
          height: Platform.OS === "ios" ? 90 : 70,
          shadowColor: "transparent", // Remove header shadow
          elevation: 0,
          backgroundColor: backgroundColor,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
          color: isDark ? "#e5e7eb" : "#111827",
        },
        headerStatusBarHeight: Platform.OS === "ios" ? 40 : 20,
        tabBarStyle: {
          paddingBottom: Platform.OS === "ios" ? 0 : 0, // Reduced padding on iOS
          height: Platform.OS === "ios" ? 80 : 65, // Reduced height on iOS
          borderTopWidth: 1,
          borderTopColor: borderColor,
          backgroundColor: backgroundColor,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: Platform.OS === "ios" ? 0 : 0, // Reduced padding
          marginTop: 0, // Reduced margin
        },
      }}
    >
      {/* First half of tabs */}
      {TABS_FIRST_HALF.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={({ navigation }) => ({
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={tab.iconName} color={color} focused={focused} />
            ),
            headerShown:
              tab.headerShown === false
                ? false
                : useClientOnlyValue(false, true),
          })}
        />
      ))}

      {/* New Post Tab (in the middle) */}
      <Tabs.Screen
        name="create-post"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarButton: () => (
            <NewPostButton colorScheme={colorScheme ?? "light"} />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            router.push("/post/create" as any);
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
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={tab.iconName} color={color} focused={focused} />
            ),
            headerShown:
              tab.headerShown === false
                ? false
                : useClientOnlyValue(false, true),
          }}
        />
      ))}

      {/* Hide verify email from tab bar */}
      <Tabs.Screen
        name="verifyEmail"
        options={{ 
          title: "Verify Email",
          href: null
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Container for tab icons with proper spacing
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 5,
    height: 35, // Reduced height for better proportions
  },
  // Container for the new post button
  newPostButton: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    // Improved positioning for the floating button
    marginTop: -15, // Pull up the button but less extreme than before
    // Proper padding for different platforms
    paddingBottom: Platform.OS === "ios" ? 0 : 2,
  },
  // Wrapper for the animated new post button
  newPostContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  // Styling for the circular new post button
  newPostIconContainer: {
    width: 56,
    height: 56, // Slightly smaller size for better proportions
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    // Refined shadows for a more premium look
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 7,
      },
    }),
  },
});
