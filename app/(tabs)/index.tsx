import {
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/components/SessionProvider";
import { useStorageState } from "@/hooks/useStorageState";
import { BlurView } from "expo-blur";
import { Post } from "@/types/postType";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import FeedPostItem from "@/components/post/FeedPostItem";
import FeedHeader from "@/components/post/FeedHeader";
import SortOptions from "@/components/post/SortOptions";

/**
 * Home Screen that displays the social feed with posts
 */
export default function HomeScreen() {
  const { user } = useSession();
  const [userStorage, setUser] = useStorageState("user");
  const [session, setSession] = useStorageState("session");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const windowWidth = Dimensions.get("window").width;
  const router = useRouter();

  // Use custom hook to handle posts data and operations, similar to useMyPosts hook
  const {
    posts,
    isLoading,
    isRefreshing,
    error,
    ordering,
    handleRefresh,
    handleSortChange,
    handleLike,
    handleDeepfakeDetection,
    loadData,
  } = useFeedPosts();

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter(
      (post:any) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  // Scroll handler for floating header
  const handleScroll = useCallback((event: any) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  }, []);

  // Navigation handlers
  const navigateToPost = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const navigateToCreatePost = () => {
    router.push("/post/create");
  };

  const handleLogOut = useCallback(() => {
    setUser(null);
    setSession(null);
    router.push("/login");
  }, [setUser, setSession]);

  // Error state renderer
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Floating header for better UX when scrolling
  const renderFloatingHeader = useMemo(() => {
    if (scrollPosition <= 10) return null;

    return (
      <BlurView intensity={80} style={styles.floatingHeader}>
        <Text style={styles.floatingHeaderTitle}>Social Feed</Text>
        <View style={styles.floatingHeaderRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color="#00c5e3" />
          </TouchableOpacity>
        </View>
      </BlurView>
    );
  }, [scrollPosition]);

  // Empty state component
  const EmptyStateComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00c5e3" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : (
          <View style={styles.noPostsContainer}>
            <Ionicons name="leaf-outline" size={60} color="#00c5e3" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubText}>
              Posts from all users will appear here
            </Text>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={navigateToCreatePost}
            >
              <Text style={styles.createPostButtonText}>Create Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [isLoading, navigateToCreatePost]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <FeedHeader onLogOut={handleLogOut} onCreatePost={navigateToCreatePost} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8e8e93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts...(Not Implemented)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#8e8e93" />
          </TouchableOpacity>
        ) : null}
      </View>


      {/* Content area: error, posts list, or empty state */}
      {error ? (
        renderError()
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => (
            <FeedPostItem
              post={item}
              onLike={handleLike}
              onSave={(postId: string, folderId?: string) => {
                return new Promise<boolean>((resolve) => {
                  // Add your save logic here
                  console.log(`Saving post ${postId} to folder ${folderId}`);
                  resolve(true); // Resolve with true to indicate success
                });
              }}
              onShare={(item) => {
                return new Promise<void>((resolve) => {
                  // Add your share logic here
                  console.log(`Sharing post`);
                  resolve(); // Resolve when done
                });
              }}
              onReport={(x,y) => {}}
              onDeepfakeDetection={handleDeepfakeDetection}
              onNavigate={navigateToPost}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00c5e3"
              colors={["#00c5e3"]}
            />
          }
          ListEmptyComponent={EmptyStateComponent}
        />
      )}

      {/* Floating header that appears when scrolling */}
      {renderFloatingHeader}

      {/* Loading overlay */}
      {isLoading && !isRefreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00c5e3" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(240,240,240,0.8)",
    zIndex: 100,
  },
  floatingHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00c5e3",
  },
  floatingHeaderRight: {
    flexDirection: "row",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00c5e3",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
    padding: 6,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 70, // Space for bottom tabs
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 400,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#8e8e93",
    fontSize: 16,
  },
  noPostsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  emptySubText: {
    marginTop: 8,
    textAlign: "center",
    color: "#8e8e93",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  createPostButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});
