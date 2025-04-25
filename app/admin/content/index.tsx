import React, { useEffect, useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { useAdminPosts, adminDeletePost } from "@/hooks/admin/useAdminPost";
import { useRouter } from "expo-router";
import { Post } from "@/types/postType";
import { useAdminStats } from "@/hooks/admin/useAdminStats";

// The choice of filter options
const filterOptions = [{ label: "All" }, { label: "Flagged as DeepFake" }, 
{ label: "Not analyzed" }];
const filterNumbers = filterOptions.length;

export default function ContentModerationScreen() {
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<number>(0);
  const router = useRouter();

  const {
    posts,
    loading: postLoading,
    error,
    refresh,
    hasNextPage,
    filterPosts,
  } = useAdminPosts({
    page,
    pageSize: 10,
    fetchAll: false,
    forceRefresh: false,
  });
  const {stats} = useAdminStats();

  const numberOfPosts = stats?.posts || 0;

  useEffect(() => {
    setHasMore(hasNextPage);
    setFilter(0);
  }, [hasNextPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  if (error) {
    Alert.alert("Error", error || "Something went wrong");
  }

  const handleFilterPosts = async () => {
    setIsRefreshing(true);
    // A rolling filter
    // 0: All,
    // 1: Flagged as DeepFake
    // 2: Not analyzed
    const filterValue = (filter + 1) % filterNumbers;
    setFilter(filterValue);
    await filterPosts(filterValue);
    setIsRefreshing(false);
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          adminDeletePost(postId)
            .then(() => {
              Alert.alert("Success", "Post deleted successfully");
              refresh();
            })
            .catch((err) => {
              Alert.alert("Error", err.message || "Failed to delete post");
            });
        },
      },
    ]);
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportText}>
        Post Title: {item.caption || "No Title"}
      </Text>
      {item.content && (
        <Text style={styles.reportText}>
          Post Content:{" "}
          {item.content.length > 20
            ? item.content.slice(0, 20) + "..."
            : item.content}
        </Text>
      )}
      <View style={styles.handleContainer}>
        <TouchableOpacity
          style={styles.handleDeleteButton}
          onPress={() => handleDeletePost(item.id)}
        >
          <Text style={styles.handleButtonText}>Delete(admin)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.handleButton}
          onPress={() => router.push(`/post/${item.id}`)}
        >
          <Text style={styles.handleButtonText}>Check</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Stats */}
      {postLoading ? (
        <ActivityIndicator size="small" color="#00c5e3" />
      ) : (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            <Text style={styles.statsHighlight}>All Posts:</Text>{" "}
            {numberOfPosts}
          </Text>
        </View>
      )}

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPosts}>
          <Text style={styles.filterButtonText}>{filterOptions[filter].label}</Text>
        </TouchableOpacity>
      </View>

      {/* Post List */}
      {postLoading && page === 1 ? (
        <ActivityIndicator size="large" color="#00c5e3" />
      ) : posts?.length === 0 ? (
        <Text style={styles.emptyText}>No posts</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator size="small" color="#00c5e3" />
            ) : null
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FDFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#006D87",
  },
  statsContainer: {
    marginBottom: 20,
    backgroundColor: "#E6F9FF",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#00c5e3",
  },
  statsText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  statsHighlight: {
    fontWeight: "600",
    color: "#006D87",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: "#00c5e3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportItem: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#00c5e3",
    shadowColor: "#00c5e3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  statusText: {
    fontSize: 15,
    marginBottom: 12,
    color: "#555",
  },
  pendingStatus: {
    color: "#FF9500",
    fontWeight: "600",
  },
  resolvedStatus: {
    color: "#34C759",
    fontWeight: "600",
  },
  handleButton: {
    backgroundColor: "#00c5e3",
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
    marginRight: 10,
  },
  handleDeleteButton: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
    marginRight: 10,
  },
  handleButtonText: {
    color: "white",
    fontWeight: "500",
  },
  handleContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 16,
  },
});
