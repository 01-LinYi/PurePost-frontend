// UserListModal.tsx
import React, { useEffect, useCallback } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { Image } from "@/components/CachedImage";
import useInteractList, {
  ListedUser,
  InteractType,
} from "@/hooks/useInteractList";
import { useRouter, useLocalSearchParams } from "expo-router";

/**
 * UserListModal displays a list of users who interacted with a post
 * This component is structured as a screen that visually appears as a modal
 */
const UserListModal: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const type = (params.type as InteractType) || "likes";
  const postId = (params.postId as string) || "";
  const hasError = params.hasError ? Number(params.hasError) : 0;

  useEffect(() => {
    console.log("UserListModal params:", { type, postId, hasError });
  }, [type, postId, hasError]);

  const { users, fetchUsers, isLoading } = useInteractList();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = React.useState(false);

  const initialFetchDone = React.useRef(false);

  const animationValuesRef = React.useRef(new Map());

  const areParamsValid = useCallback(() => {
    return !!type && !!postId;
  }, [type, postId]);

  useEffect(() => {
    if (!areParamsValid()) {
      console.warn("Invalid params for UserListModal:", { type, postId });
      return;
    }

    if (!initialFetchDone.current) {
      const timer = setTimeout(() => {
        fetchUsers(type, postId);
        initialFetchDone.current = true;
      }, 50);

      return () => clearTimeout(timer);
    } else {
      fetchUsers(type, postId);
    }
  }, [type, postId, areParamsValid]);

  const handleRefresh = useCallback(() => {
    if (!areParamsValid()) {
      console.warn("Invalid params for refresh:", { type, postId });
      return Promise.resolve();
    }

    setRefreshing(true);
    console.log("Refreshing user list:", type, postId);

    return fetchUsers(type, postId).finally(() => {
      setRefreshing(false);
    });
  }, [fetchUsers, type, postId, areParamsValid]);

  /**
   * Returns the appropriate title and icon based on interaction type
   */
  const getInteractionDetails = useCallback(() => {
    switch (type) {
      case "likes":
        return {
          title: "Likes",
          icon: "heart",
          iconColor: "#FF3B5C",
        };
      case "comments":
        return {
          title: "Comments",
          icon: "chatbubble",
          iconColor: "#5458F7",
        };
      case "shares":
        return {
          title: "Shares",
          icon: "share",
          iconColor: "#4CAF50",
        };
      default:
        return {
          title: "Interactions",
          icon: "people",
          iconColor: "#666",
        };
    }
  }, [type]);

  const { title, icon, iconColor } = getInteractionDetails();

  // Header shadow animation
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 20],
    outputRange: [0, 0.3],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (users) {
      users.forEach((user, index) => {
        if (!animationValuesRef.current.has(user.id)) {
          animationValuesRef.current.set(user.id, {
            translateY: new Animated.Value(20),
            opacity: new Animated.Value(0),
          });
        }
      });
    }
  }, [users]);

  const startAnimation = useCallback((id: string, index: number) => {
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

  useEffect(() => {
    if (users) {
      users.forEach((user, index) => {
        startAnimation(user.id, index);
      });
    }
  }, [users, startAnimation]);

  /**
   * Renders an individual user item in the list
   */
  const renderUserItem = useCallback(
    ({ item, index }: { item: ListedUser; index: number }) => {
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
            onPress={() => router.push(`/user/${item.name}`)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [router]
  );

  const hasUsers = Array.isArray(users) && users.length > 0;
  console.log("Render decision:", {
    isLoading,
    refreshing,
    hasError,
    hasUsers,
    usersLength: users?.length || 0,
  });

  // Empty state component with animation
  const EmptyState = useCallback(() => {
    const emptyScale = React.useRef(new Animated.Value(0.8)).current;
    const emptyOpacity = React.useRef(new Animated.Value(0)).current;

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
        <Ionicons name={icon as any} size={64} color="#DDDDDD" />
        <Text style={styles.emptyTitle}>No {title.toLowerCase()} yet</Text>
        <Text style={styles.emptyText}>
          Be the first to interact with this post
        </Text>
      </Animated.View>
    );
  }, [icon, title]);

  return (
    <View style={[styles.container]}>
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
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Ionicons
              name={icon as any}
              size={22}
              color={iconColor}
              style={styles.titleIcon}
            />
            <Text style={styles.title}>{title}</Text>
            {hasUsers && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{users.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.rightPlaceholder} />
        </View>
      </Animated.View>

      {/* Content area - 使用更明确的条件渲染 */}
      {isLoading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={iconColor} />
          <Text style={styles.loaderText}>Loading users...</Text>
        </View>
      ) : hasError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
          <Text style={styles.errorTitle}>Couldn't load users</Text>
          <Text style={styles.errorText}>An unexpected error occurred.</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: iconColor }]}
            onPress={() => fetchUsers(type, postId)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : hasUsers ? (
        <Animated.FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
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
              onRefresh={handleRefresh}
              tintColor={iconColor}
              colors={[iconColor]}
              progressViewOffset={10}
            />
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
};

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
    padding: 8,
    borderRadius: 20,
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
  countBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  countText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
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
  userUsername: {
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
});

export default UserListModal;
