import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Platform,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useSession } from "@/components/SessionProvider";
import * as api from "@/utils/api";
import { Follow } from "@/types/followType";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
export default function Followers() {
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { user } = useSession();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const animationValuesRef = useRef(new Map());

  if (!user) {
    console.error("Current User not found");
    return null;
  }

  // Header shadow animation
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.3],
    extrapolate: "clamp",
  });

  // Function to fetch more followers
  const fetchMoreFollowers = useCallback(async () => {
    if (loadingMore || next === null) return;

    setLoadingMore(true);
    try {
      const res = await api.fetchFollowers(user.id, next);
      setFollowers((prev) => [...prev, ...res.results]);
      setNext(res.next);
      setHasError(false);
    } catch (error) {
      console.error("Error fetching more followers:", error);
      setHasError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, next, user?.id]);

  // Function to refresh followers
  const refreshFollowers = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.fetchFollowers(user.id, null);
      setFollowers(res.results);
      setNext(res.next);
      setHasError(false);
    } catch (error) {
      console.error("Error refreshing followers:", error);
      setHasError(true);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]);

  // Initial data fetching
  useEffect(() => {
    const fetchInitialFollowers = async () => {
      setIsLoading(true);
      try {
        const res = await api.fetchFollowers(user.id, null);
        setFollowers(res.results);
        setNext(res.next);
        setHasError(false);
      } catch (error) {
        console.error("Error fetching followers:", error);
        setHasError(true);
        Alert.alert("Error", "Failed to load followers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialFollowers();
  }, [user?.id]);

  // Setup animation values when followers list changes
  useEffect(() => {
    if (followers.length > 0) {
      followers.forEach((item) => {
        if (!animationValuesRef.current.has(item.id)) {
          animationValuesRef.current.set(item.id, {
            translateY: new Animated.Value(20),
            opacity: new Animated.Value(0),
          });
        }
      });
    }
  }, [followers]);

  // Start animations
  const startAnimation = useCallback((id: number, index: number) => {
    const animValues = animationValuesRef.current.get(id);
    if (!animValues) return;

    Animated.timing(animValues.translateY, {
      toValue: 0,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();

    Animated.timing(animValues.opacity, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  // Trigger animations when followers change
  useEffect(() => {
    if (followers.length > 0) {
      followers.forEach((follower, index) => {
        startAnimation(follower.id, index);
      });
    }
  }, [followers, startAnimation]);

  // Render a follower item with animation
  const renderFollowerItem = useCallback(
    ({ item, index }: { item: Follow; index: number }) => {
      const animValues = animationValuesRef.current.get(item.id) || {
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
      };

      return (
        <Animated.View
          style={[
            styles.userItem,
            {
              opacity: animValues.opacity,
              transform: [{ translateY: animValues.translateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.userItemContent}
            onPress={() => {
              router.push(`/user/${item.follower_details.username}`);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.follower_details.username}
              </Text>
              <Text style={styles.userBio} numberOfLines={1}>
                {item.follower_details.email}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    []
  );

  // Empty state component with animation
  const EmptyState = useCallback(() => {
    const emptyScale = useRef(new Animated.Value(0.8)).current;
    const emptyOpacity = useRef(new Animated.Value(0)).current;

    React.useLayoutEffect(() => {
      try {
        Animated.parallel([
          Animated.spring(emptyScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
          }),
          Animated.timing(emptyOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error("EmptyState animation error:", error);
      }
    }, []);

    return (
      <Animated.View
        style={[
          styles.emptyContainer,
          {
            opacity: emptyOpacity,
            transform: [{ scale: emptyScale }],
          },
        ]}
      >
        <Ionicons name="people-outline" size={64} color="#DDDDDD" />
        <Text style={styles.emptyTitle}>No followers yet</Text>
        <Text style={styles.emptyText}>
          When people follow you, they'll appear here
        </Text>
      </Animated.View>
    );
  }, []);

  const hasFollowers = Array.isArray(followers) && followers.length > 0;

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            shadowOpacity: headerShadowOpacity,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#29B6F6" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Ionicons
              name="people"
              size={22}
              color="#29B6F6"
              style={styles.titleIcon}
            />
            <Text style={styles.title}>Followers</Text>
          </View>
          <View style={styles.rightPlaceholder} />
        </View>
      </Animated.View>

      {/* Content Area */}
      {isLoading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#29B6F6" />
          <Text style={styles.loaderText}>Loading followers...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorTitle}>Couldn't load followers</Text>
          <Text style={styles.errorText}>An unexpected error occurred.</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: "#29B6F6" }]}
            onPress={refreshFollowers}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : hasFollowers ? (
        <Animated.FlatList
          data={followers}
          renderItem={renderFollowerItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.userList}
          contentContainerStyle={styles.listContentContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshFollowers}
              tintColor="#29B6F6"
              colors={["#29B6F6"]}
              progressViewOffset={10}
            />
          }
          onEndReached={fetchMoreFollowers}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#29B6F6" />
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <EmptyState />
        </View>
      )}

      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  rightPlaceholder: {
    width: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
  },
  errorText: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 40,
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  userList: {
    flex: 1,
  },
  listContentContainer: {
    paddingTop: 8,
    paddingBottom: 30,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#888888",
    textAlign: "center",
    marginTop: 8,
  },
  userItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  userBio: {
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
  },
  followButtonText: {
    color: "#333333",
    fontWeight: "600",
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
