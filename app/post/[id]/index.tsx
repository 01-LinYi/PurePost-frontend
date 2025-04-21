// app/post/[id]/index.tsx - Post detail screen displaying full post content

import { useState, useEffect, useCallback } from "react";
import { StyleSheet, Alert, StatusBar, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "@/components/Themed";
import ActionButton from "@/components/ActionButton";
import PostContent from "@/components/post/PostContent";
import CommentInput from "@/components/post/CommentInput";
import CompactHeader from "@/components/CompactHeader";
import * as api from "@/utils/api";
import { Post, Comment } from "@/types/postType";
import { transformApiPostToPost } from "@/utils/transformers/postsTransformers";
import { performOptimisticUpdate } from "@/utils/optimiticeUP";
import { useFolders } from "@/hooks/useFolders";
import { SavedFolder } from "@/types/folderType";
import { unSavePost } from "@/utils/api";
import FolderSelectorModal from "@/components/folder/FolderSelectorModal";

/**
 * Post detail screen that displays a single post with full content and interactions
 */
const PostDetail = () => {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State to hold the post data and related information
  const [postData, setPostData] = useState<{
    post: Post | null;
    comments: Comment[];
  }>({
    post: null,
    comments: [],
  });

  // UI state for loading and action indicators
  const [uiState, setUiState] = useState({
    isLoading: true,
    isSubmittingAction: false,
  });

  const { post, comments } = postData;
  const { isLoading, isSubmittingAction } = uiState;
  const [foldermodalVisible, setFolderModalVisible] = useState(false);
  const [selectionError, setSelectorError] = useState<string | null>(null);
  const [collecting, setCollecting] = useState(false);
  // Use custom hook to handle folders data and operations
  const {
    folders,
    isLoading: foldersLoading,
    error: foldersError,
    refresh: refreshFolders,
    toggleSaveFolder,
    createFolder,
    isCreating,
  } = useFolders({
    forceRefresh: true,
  });

  /**
   * Load post data from the API
   */
  const loadPostData = useCallback(
    async (forceRefresh: boolean) => {
      if (typeof id !== "string") {
        Alert.alert("Error", "Invalid post ID");
        return;
      }

      try {
        setUiState((prev) => ({ ...prev, isLoading: true }));
        console.log(`Fetching post with ID: ${id}`);

        const res = await api.fetchSinglePosts(id, forceRefresh);
        const apiPost = res.data;

        // Transform API response to our frontend Post model
        const transformedPost = transformApiPostToPost(apiPost);
        console.log("Transformed post data:", transformedPost);

        setPostData({
          post: transformedPost,
          comments: apiPost?.comments || [],
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        Alert.alert("Error", "Failed to load post: " + errorMessage);
      } finally {
        setUiState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [id]
  );

  // Load post when component mounts or ID changes
  useEffect(() => {
    loadPostData(false);
  }, [id, loadPostData]);

  const handleRefresh = async () => {
    setUiState((prev) => ({ ...prev, isLoading: true }));
    try {
      await loadPostData(true);
    } catch (error) {
      console.error("Failed to refresh post data:", error);
    } finally {
      setUiState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Handle like/unlike action
   */
  const handleLike = async () => {
    if (!post || isSubmittingAction) return;

    setUiState((prev) => ({ ...prev, isSubmittingAction: true }));

    const newIsLiked = !post.is_liked;

    const result = await performOptimisticUpdate({
      updateUI: () => {
        setPostData((prev) => ({
          ...prev,
          post: prev.post
            ? {
                ...prev.post,
                is_liked: newIsLiked,
                like_count: prev.post.like_count + (newIsLiked ? 1 : -1),
              }
            : null,
        }));
      },
      apiCall: async () =>
        newIsLiked
          ? api.likePost(Number(post.id))
          : api.unlikePost(Number(post.id)),
      rollbackUI: () => {
        setPostData((prev) => ({
          ...prev,
          post: prev.post
            ? {
                ...prev.post,
                is_liked: !newIsLiked,
                like_count: prev.post.like_count + (newIsLiked ? -1 : 1),
              }
            : null,
        }));
      },
      errorMessagePrefix: `Failed to ${newIsLiked ? "like" : "unlike"} post: `,
    });

    if (result) {
      console.log(`Post ${post.id} ${newIsLiked ? "liked" : "unliked"}`);
    }

    setUiState((prev) => ({ ...prev, isSubmittingAction: false }));
  };

  /**
   * Navigate to edit post screen
   */
  const handleEdit = useCallback(() => {
    if (post) router.push(`/post/${post.id}/edit`);
  }, [post]);

  /**
   * Handle share action
   */
  const handleShare = useCallback(() => {
    if (!post) return;

    // Update share count optimistically
    const newShareCount = post.share_count + 1;

    setPostData((prev) => ({
      ...prev,
      post: prev.post
        ? {
            ...prev.post,
            share_count: newShareCount,
          }
        : null,
    }));

    // In a real app, you would call an API to track the share
    console.log(`Sharing post ${post.id}, new share count: ${newShareCount}`);
    Alert.alert(
      "Share Success",
      `Content has been shared. Current share count: ${newShareCount}`
    );
  }, [post]);

  /**
   * Handle save/unsave action
   */
  const handleSave = useCallback( () => {
    if (!post || isSubmittingAction) return;

    setUiState((prev) => ({ ...prev, isSubmittingAction: true }));
    setFolderModalVisible(false);

    const newIsSaved = !post.is_saved;
    if (newIsSaved) {
      setCollecting(true);
      setSelectorError(null);
      setFolderModalVisible(true);
      setCollecting(false);
    } else {
      // Unsave the post
      performOptimisticUpdate({
        updateUI: () => {
          setPostData((prev) => ({
            ...prev,
            post: prev.post ? { ...prev.post, is_saved: false } : null,
          }));
        },
        apiCall: () => unSavePost(post.id),
        rollbackUI: () => {
          setPostData((prev) => ({
            ...prev,
            post: prev.post ? { ...prev.post, is_saved: true } : null,
          }));
        },
        errorMessagePrefix: "Failed to unsave post: ",
      });
      setUiState((prev) => ({ ...prev, isSubmittingAction: false }));
    }
  }, [post, isSubmittingAction, foldermodalVisible]);

  const handleSelectFolder = async (folder: SavedFolder) => {
    setCollecting(true);
    setSelectorError(null);
    try {
      await toggleSaveFolder(id as string, folder.id);
      setFolderModalVisible(false);
      handleRefresh();
      // toast("Success")
    } catch (e) {
      setSelectorError("Save failed, please try again");
    }
    setCollecting(false);
  };

  const handleCreateFolder = async (name: string) => {
    setSelectorError(null);
    try {
      await createFolder(name);
      await refreshFolders();
    } catch (e) {
      setSelectorError("Create failed, please try again");
      throw e;
    }
  };

  /**
   * Add a new comment
   */
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

      // Reload post data to get updated comments
      handleRefresh();
    }

    setUiState((prev) => ({ ...prev, isSubmittingAction: false }));
  };

  /**
   * Delete a comment
   */
  const handleDeleteComment = async (commentId: number) => {
    if (!post || isSubmittingAction) return;
    setUiState((prev) => ({ ...prev, isSubmittingAction: true }));
    const result = await performOptimisticUpdate({
      updateUI: () => {},
      apiCall: () => api.deleteComment(post.id, commentId.toString()),
      rollbackUI: () => {},
      errorMessagePrefix: "Failed to delete comment: ",
    });
    if (result) {
      console.log(`Comment ${commentId} deleted successfully`);
      // Reload post data to get updated comments
      handleRefresh();
    }
    setUiState((prev) => ({ ...prev, isSubmittingAction: false }));
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00c5e3" />
      </View>
    );
  }

  // Render error state if post not found
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
      <CompactHeader
        title={"Post Detail"}
        onBack={() => router.back()}
        rightIcon={{
          name: "ellipsis-horizontal",
          label: "More",
          onPress: () => {
            // Handle more options here
          },
        }}
      />
      {/* Post content component */}
      <PostContent
        post={post}
        comments={comments}
        onLike={handleLike}
        onEdit={handleEdit}
        onShare={handleShare}
        onSave={handleSave}
        ondeleteComment={handleDeleteComment}
        bottomPadding={Math.max(20, insets.bottom) + 70}
      />

      {/* Comment input component */}
      <CommentInput
        onSubmit={handleAddComment}
        bottomInset={Math.max(10, insets.bottom)}
        isSubmitting={isSubmittingAction}
      />
      {/* Folder selector modal */}
      <FolderSelectorModal
        visible={foldermodalVisible}
        folders={folders}
        onSelect={handleSelectFolder}
        onCreate={handleCreateFolder}
        onClose={() => setFolderModalVisible(false)}
        isCreating={isCreating}
        isCollecting={collecting}
        error={selectionError || foldersError}
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
  header: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default PostDetail;
