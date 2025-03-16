import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import axiosInstance from "@/utils/axiosInstance";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Post } from "@/types/postType";
import { useSession } from "@/components/SessionProvider"; // 假设您有一个认证上下文


interface ApiPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
  like_count: number;
  share_count: number;
  is_liked: boolean;
  is_saved: boolean;
  visibility: "public" | "private";
  user: {
    id: number | string;
    username: string;
    email: string;
  };
  image: string | null;
  video: string | null;
}

// mapping of frontend ordering to API ordering
export const getApiOrdering = (frontendOrdering: string): string => {
  const mapping: Record<string, string> = {
    "-createdAt": "-created_at",
    createdAt: "created_at",
    "-likesCount": "-like_count",
    "-commentsCount": "-comment_count",
  };
  return mapping[frontendOrdering] || "-created_at";
};
export const transformApiPostToPost = (apiPost: ApiPost): Post => {
  const author = {
    id: String(apiPost.user.id),
    name: apiPost.user.username,
    avatar: "",
  };

  let media = null;
  if (apiPost.image) {
    media = { uri: apiPost.image, name:"", type: "image/jpeg" };
  } else if (apiPost.video) {
    media = { uri: apiPost.video,name:"", type: "video/mp4" };
  }

  return {
    id: String(apiPost.id),
    text: apiPost.content,
    media: media,
    author: author,
    createdAt: apiPost.created_at,
    updatedAt: apiPost.updated_at,
    likesCount: apiPost.like_count,
    commentsCount: apiPost.comment_count,
    shareCount: apiPost.share_count,
    isLiked: apiPost.is_liked,
    isSaved: apiPost.is_saved,
    visibility: apiPost.visibility,
    isEdited: new Date(apiPost.updated_at) > new Date(apiPost.created_at),
  };
};

const MyPosts = () => {
  const { user } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<string>("-createdAt");

  // const [hasMore, setHasMore] = useState(false);
  // const [nextPage, setNextPage] = useState<string | null>(null);

  const insets = useSafeAreaInsets();

  const fetchMyPosts = useCallback(async () => {
    try {
      setError(null);
      console.log("Fetching posts with user ID:", user?.id);

      const endpoint = "/content/posts/";
      const params = {
        user_id: user?.id,
        ordering: getApiOrdering(ordering),
      };

      console.log("Making request to:", endpoint, "with params:", params);
      const response = await axiosInstance.get(endpoint, { params });

      console.log("Response received:", response.status);

      const apiPosts: ApiPost[] = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      console.log(`Found ${apiPosts.length} posts`);
      console.log("API response:", JSON.stringify(response.data, null, 2));
      const newPosts = apiPosts.map(transformApiPostToPost);

      setPosts(newPosts);

      return newPosts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      console.error("Error details:", {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      });
      const errorMessage =
        (error as any)?.response?.data?.detail || "Failed to load your posts";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [ordering, user?.id]);

  const loadData = useCallback(
    async (showFullLoading = true) => {
      try {
        if (showFullLoading) {
          setIsLoading(true);
        }
        await fetchMyPosts();
      } catch (error) {
        console.error("Load data error:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchMyPosts]
  );

  // const loadMoreData = useCallback(async () => {...}, []);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [loadData, user?.id]);

  //
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(false);
  }, [loadData]);

  //
  const handleSortChange = useCallback(
    (newOrdering: string) => {
      if (ordering !== newOrdering) {
        setOrdering(newOrdering);
        setIsLoading(true);
        loadData();
      }
    },
    [ordering, loadData]
  );

  const navigateToPost = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const navigateToCreatePost = () => {
    router.push("/post/create");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleDeletePost = useCallback((postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await axiosInstance.delete(`/content/posts/${postId}/`);

            setPosts((currentPosts) =>
              currentPosts.filter((post) => post.id !== postId)
            );

            Alert.alert("Success", "Post deleted successfully");
          } catch (error) {
            console.error("Error deleting post:", error);
            Alert.alert(
              "Error",
              (error as any)?.response?.data?.detail || "Failed to delete post"
            );
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  }, []);

  //
  const renderPostItem = ({ item }: { item: Post }) => {
    //
    const lines = item.text.split("\n");
    const title = lines[0] || "Untitled Post";

    //
    const contentPreview =
      lines.length > 1
        ? lines.slice(1).join(" ").substring(0, 100) +
          (lines.slice(1).join(" ").length > 100 ? "..." : "")
        : "No additional content";

    return (
      <TouchableOpacity
        style={styles.postItem}
        onPress={() => navigateToPost(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.postContent}>
          <View style={styles.postHeader}>
            <Text style={styles.postTitle} numberOfLines={1}>
              {title}
            </Text>

            <View style={styles.visibilityTag}>
              <Ionicons
                name={
                  item.visibility === "public"
                    ? "globe-outline"
                    : "lock-closed-outline"
                }
                size={12}
                color={item.visibility === "public" ? "#00c5e3" : "#FF9800"}
              />
              <Text
                style={[
                  styles.visibilityText,
                  {
                    color: item.visibility === "public" ? "#00c5e3" : "#FF9800",
                  },
                ]}
              >
                {item.visibility === "public" ? "Public" : "Private"}
              </Text>
            </View>
          </View>

          <View style={styles.postDetailsRow}>
            {item.media && (
              <Image
                source={{ uri: item.media.uri }}
                style={styles.mediaThumbnail}
                resizeMode="cover"
              />
            )}

            <View style={[styles.postTextContent, !item.media && { flex: 1 }]}>
              <Text style={styles.postExcerpt} numberOfLines={2}>
                {contentPreview}
              </Text>
            </View>
          </View>

          <View style={styles.postMeta}>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
              {item.isEdited && (
                <Text style={styles.editedText}> (edited)</Text>
              )}
            </Text>

            <View style={styles.statsContainer}>
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={14}
                color={item.isLiked ? "#FF6B6B" : "#888"}
              />
              <Text style={styles.statText}>{item.likesCount}</Text>

              <Ionicons
                name="chatbubble-outline"
                size={14}
                color="#888"
                style={{ marginLeft: 8 }}
              />
              <Text style={styles.statText}>{item.commentsCount}</Text>

              {item.shareCount !== undefined && (
                <>
                  <Ionicons
                    name="share-outline"
                    size={14}
                    color="#888"
                    style={{ marginLeft: 8 }}
                  />
                  <Text style={styles.statText}>{item.shareCount}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/post/edit/${item.id}`)}
            >
              <Ionicons name="pencil-outline" size={16} color="#00c5e3" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePost(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // render empty state
  const renderEmptyState = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>
          Share your thoughts by creating your first post
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={navigateToCreatePost}
        >
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>
    );
  };


  // const renderFooter = () => {...};

  return (
    <View style={[styles.container, { paddingTop: 5 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Posts</Text>

        <TouchableOpacity
          style={styles.createPostButton}
          onPress={navigateToCreatePost}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.createPostButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sortOptions}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              ordering === "-createdAt" && styles.sortButtonActive,
            ]}
            onPress={() => handleSortChange("-createdAt")}
          >
            <Text
              style={[
                styles.sortButtonText,
                ordering === "-createdAt" && styles.sortButtonTextActive,
              ]}
            >
              Newest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              ordering === "createdAt" && styles.sortButtonActive,
            ]}
            onPress={() => handleSortChange("createdAt")}
          >
            <Text
              style={[
                styles.sortButtonText,
                ordering === "createdAt" && styles.sortButtonTextActive,
              ]}
            >
              Oldest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              ordering === "-likesCount" && styles.sortButtonActive,
            ]}
            onPress={() => handleSortChange("-likesCount")}
          >
            <Text
              style={[
                styles.sortButtonText,
                ordering === "-likesCount" && styles.sortButtonTextActive,
              ]}
            >
              Most Liked
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortButton,
              ordering === "-commentsCount" && styles.sortButtonActive,
            ]}
            onPress={() => handleSortChange("-commentsCount")}
          >
            <Text
              style={[
                styles.sortButtonText,
                ordering === "-commentsCount" && styles.sortButtonTextActive,
              ]}
            >
              Most Comments
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadData()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          // 移除列表底部组件
          // ListFooterComponent={renderFooter}
          // 移除加载更多触发器
          // onEndReached={loadMoreData}
          // onEndReachedThreshold={0.3}
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

      {isLoading && !isRefreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00c5e3" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // keep the styles you already have
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00c5e3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  createPostButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  sortOptions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  sortButtonActive: {
    backgroundColor: "#00c5e3",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#666",
  },
  sortButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  postItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  postContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  visibilityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  visibilityText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: "500",
  },
  postDetailsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  postTextContent: {
    flex: 1,
  },
  postExcerpt: {
    fontSize: 14,
    color: "#666",
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: "#888",
  },
  editedText: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#999",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#888",
    marginLeft: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#00c5e3",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  // footerLoader: {...},
});

export default MyPosts;
