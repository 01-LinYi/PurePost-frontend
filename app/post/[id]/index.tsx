import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import ActionButton from "@/components/ActionButton";
import PostContent from "@/components/post/PostContent";
import CommentInput from "@/components/post/CommentInput";
import * as api from "@/utils/api";
import { Post, Comment } from "@/types/postType";
import { transformApiPostToPost } from "../my_posts";
import { performOptimisticUpdate } from "@/utils/optimiticeUP";

const PostDetail = () => {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [postData, setPostData] = useState<{
    post: Post | null;
    comments: Comment[];
    isLiked: boolean;
    isSaved: boolean;
    likesCount: number;
    shareCount: number;
  }>({
    post: null,
    comments: [],
    isLiked: false,
    isSaved: false,
    likesCount: 0,
    shareCount: 0,
  });
  const [uiState, setUiState] = useState({
    isLoading: true,
    isSubmittingAction: false,
  });

  const { post, comments, isLiked, isSaved, likesCount, shareCount } = postData;
  const { isLoading, isSubmittingAction } = uiState;

  const loadPostData = useCallback(async () => {
    if (typeof id !== "string") {
      Alert.alert("Error", "Invalid post ID");
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, isLoading: true }));
      console.log(`Fetching post with ID: ${id}`);

      const res = await api.fetchSinglePosts(id);
      const data = res.data;
      console.log("Post data:", data);
      const transformedPost = transformApiPostToPost(data);

      setPostData({
        post: transformedPost,
        comments: data?.comments || [],
        isLiked: data.isLiked || false,
        isSaved: data.isSaved || false,
        likesCount: data?.likesCount || 0,
        shareCount: data?.shareCount || 0,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", "Failed to load post: " + errorMessage);
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [id]);

  useEffect(() => {
    loadPostData();
  }, [loadPostData]);

  // 事件处理函数
  const handleLike = async () => {
    if (!post || isSubmittingAction) return;

    setUiState((prev) => ({ ...prev, isSubmittingAction: true }));

    const newIsLiked = !isLiked;

    const result = await performOptimisticUpdate({
      updateUI: () => {
        setPostData((prev) => ({
          ...prev,
          isLiked: newIsLiked,
          likesCount: prev.likesCount + (newIsLiked ? 1 : -1),
        }));
      },
      apiCall: async () =>
        newIsLiked
          ? api.likePost(Number(post.id))
          : api.unlikePost(Number(post.id)),
      rollbackUI: () => {
        setPostData((prev) => ({
          ...prev,
          isLiked: !newIsLiked,
          likesCount: prev.likesCount + (newIsLiked ? -1 : 1),
        }));
      },
      errorMessagePrefix: `Failed to ${newIsLiked ? "like" : "unlike"} post: `,
    });

    if (result) {
      console.log(`Post ${post.id} ${newIsLiked ? "liked" : "unliked"}`);
    }

    if (result) {
      console.log(`Post ${post.id} ${newIsLiked ? "liked" : "unliked"}`);
    }

    setUiState((prev) => ({ ...prev, isSubmittingAction: false }));
  };

  const handleEdit = useCallback(() => {
    if (post) router.push(`/post/${post.id}/edit`);
  }, [post]);

  const handleShare = useCallback(() => {
    // 模拟分享功能
    const newShareCount = shareCount === 0 ? 1 : 0;

    setPostData((prev) => ({
      ...prev,
      shareCount: newShareCount,
    }));

    console.log(`Simulated share operation, new share count: ${newShareCount}`);
    Alert.alert(
      "Share Success",
      `Content has been shared. Current share count: ${newShareCount}`
    );
  }, [shareCount]);

  const handleSave = async () => {
    if (!post || isSubmittingAction) return;

    setUiState((prev) => ({ ...prev, isSubmittingAction: true }));

    const newIsSaved = !isSaved;

    const result = await performOptimisticUpdate({
      updateUI: () => {
        setPostData((prev) => ({
          ...prev,
          isSaved: newIsSaved,
        }));
      },
      apiCall: async () => api.toggleSavePost(post.id),
      rollbackUI: () => {
        setPostData((prev) => ({
          ...prev,
          isSaved: !newIsSaved,
        }));
      },
      successMessage: newIsSaved
        ? "Post saved successfully!"
        : "Post removed from saved items",
      errorMessagePrefix: `Failed to ${newIsSaved ? "save" : "unsave"} post: `,
    });

    setUiState((prev) => ({ ...prev, isSubmittingAction: false }));
  };

  const handleAddComment = async (text: string) => {
    if (!text.trim() || !post || isSubmittingAction) return;

    setUiState((prev) => ({ ...prev, isSubmittingAction: true }));

    const result = await performOptimisticUpdate({
      updateUI: () => {},
      apiCall: () => api.addComment(post.id, text),
      rollbackUI: () => {},
      errorMessagePrefix: "Failed to add comment: ",
    });

    if (result) {
      console.log(`Comment added successfully: ${text}`);

      await loadPostData();
    }

    setUiState((prev) => ({ ...prev, isSubmittingAction: false }));
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00c5e3" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Post not found</Text>
        <ActionButton
          text="Go back"
          onPress={() => router.back()}
          style={styles.goBackButton}
          textStyle={styles.goBackButtonText}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {post.isAuthor && (
        <TouchableOpacity
          style={[styles.editButton, { top: insets.top + 10 }]}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      )}

      <PostContent
        post={post}
        isLiked={isLiked}
        isSaved={isSaved}
        likesCount={likesCount}
        commentsCount={comments.length}
        shareCount={shareCount}
        comments={comments}
        onLike={handleLike}
        onEdit={post.isAuthor ? handleEdit : undefined}
        onShare={handleShare}
        onSave={handleSave}
        bottomPadding={Math.max(20, insets.bottom) + 70}
      />

      <CommentInput
        onSubmit={handleAddComment}
        bottomInset={Math.max(10, insets.bottom)}
        isSubmitting={isSubmittingAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#FF6B6B",
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 20,
  },
  goBackButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 4,
    zIndex: 10,
  },
  editButton: {
    position: "absolute",
    right: 16,
    backgroundColor: "#00c5e3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default PostDetail;
