// app/post/my_posts.tsx - Screen displaying the user's own posts

import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Text, View } from "@/components/Themed";
import { useSession } from "@/components/SessionProvider";
import { useMyPosts } from "@/hooks/useMyPosts";
import MyPostsHeader from "@/components/post/MyPostHeader";
import MyPostItem from "@/components/post/MyPostItems";
import SortOptions from "@/components/post/SortOptions";
import EmptyState from "@/components/post/EmptyState";

/**
 * Screen that displays all posts created by the current user
 */
export default function MyPosts() {
  const { user } = useSession();

  // Use custom hook to handle posts data and operations
  const {
    posts,
    isLoading,
    isRefreshing,
    error,
    ordering,
    handleRefresh,
    handleSortChange,
    deletePost,
    loadData,
  } = useMyPosts({ userId: user?.id.toLocaleString() });

  // Navigation handlers
  const navigateToPost = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const navigateToCreatePost = () => {
    router.push("/post/create");
  };

  const handleGoBack = () => {
    router.back();
  };

  // Error state renderer
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with back button and create post button */}
      <MyPostsHeader
        onBack={handleGoBack}
        onCreatePost={navigateToCreatePost}
      />

      {/* Sorting options */}
      <SortOptions currentOrdering={ordering} onSortChange={handleSortChange} />

      {/* Content area: error, posts list, or empty state */}
      {error ? (
        renderError()
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <MyPostItem
              post={item}
              onDelete={deletePost}
              onNavigate={navigateToPost}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoading ? null : (
              <EmptyState onCreatePost={navigateToCreatePost} />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00c5e3"]}
              tintColor="#00c5e3"
            />
          }
        />
      )}

      {/* Loading overlay */}
      {isLoading && !isRefreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00c5e3" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 5,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
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
