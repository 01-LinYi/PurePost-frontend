import React, { useState, useEffect } from "react";
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
import axiosInstance from "@/utils/axiosInstance";
// Import types from the separate file
import { Post, Comment } from "@/types/postType";
import { transformApiPostToPost } from "../my_posts";

// API functions for interacting with posts
const fetchPost = async (id: string): Promise<Post & { comments: Comment[] }> => {
  try {
    const response = await axiosInstance.get(`/content/posts/${id}/`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};

const likePost = async (id: string): Promise<void> => {
  try {
    await axiosInstance.post(`/content/posts/${id}/like/`);
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

const unlikePost = async (id: string): Promise<void> => {
  try {
    await axiosInstance.post(`/content/posts/${id}/unlike/`);
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};

const savePost = async (postId: string, folderId?: string): Promise<void> => {
  try {
    await axiosInstance.post(`/content/saved-posts/`, {
      post_id: postId,
      folder_id: folderId
    });
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
};

const toggleSavePost = async (postId: string, folderId?: string): Promise<void> => {
  try {
    await axiosInstance.post(`/content/saved-posts/toggle/`, {
      post_id: postId,
      folder_id: folderId
    });
  } catch (error) {
    console.error("Error toggling save status:", error);
    throw error;
  }
};

const addComment = async (postId: string, text: string): Promise<Comment> => {
  try {
    // Note: This endpoint is not explicitly defined in the API doc, 
    // so I'm assuming it follows REST conventions
    const response = await axiosInstance.post(`/content/posts/${postId}/comments/`, {
      text
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

const PostDetail = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadPostData = async () => {
      try {
        setIsLoading(true);
        console.log(String(id));
        const data = await fetchPost(String(id));
        setComments(data?.comments || []);
        let postData = transformApiPostToPost(data as any);
        setPost(postData);
        setIsLiked(data.isLiked);
        setIsSaved(data.isSaved || false); // Add this if the API returns save status
        setLikesCount(data?.likesCount || 0);
        
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to load post: " +
            ((error as Error).message || "Unknown error")
        );
        console.error("Post loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPostData();
  }, [id]);

  const handleLike = async () => {
    if (!post || isSubmittingAction) return;
    
    try {
      setIsSubmittingAction(true);
      const newIsLiked = !isLiked;
      
      // Update UI immediately for better UX
      setIsLiked(newIsLiked);
      setLikesCount((prev) => prev + (newIsLiked ? 1 : -1));
      
      // Call API
      if (newIsLiked) {
        await likePost(post.id);
      } else {
        await unlikePost(post.id);
      }
      
      console.log(`Post ${post.id} ${newIsLiked ? "liked" : "unliked"}`);
    } catch (error) {
      // Revert UI changes if API call fails
      setIsLiked(!isLiked);
      setLikesCount((prev) => prev + (isLiked ? 1 : -1));
      
      Alert.alert(
        "Error",
        `Failed to ${isLiked ? "unlike" : "like"} post: ` +
          ((error as Error).message || "Unknown error")
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleEdit = () => post && router.push(`/post/${post.id}/edit`);
  
  const handleShare = () => {
    Alert.alert("Share", "Sharing functionality to be implemented");
    // Actual sharing implementation would go here
  };
  
  const handleSave = async () => {
    if (!post || isSubmittingAction) return;
    
    try {
      setIsSubmittingAction(true);
      
      // Update UI immediately for better UX
      setIsSaved(!isSaved);
      
      // Call API
      await toggleSavePost(post.id);
      
      Alert.alert(
        "Success", 
        isSaved ? "Post removed from saved items" : "Post saved successfully!"
      );
    } catch (error) {
      // Revert UI changes if API call fails
      setIsSaved(!isSaved);
      
      Alert.alert(
        "Error",
        `Failed to ${isSaved ? "unsave" : "save"} post: ` +
          ((error as Error).message || "Unknown error")
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!text.trim() || !post || isSubmittingAction) return;

    try {
      setIsSubmittingAction(true);
      
      // Create a temporary comment for immediate UI feedback
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        text,
        author: { id: "currentuser", name: "You", avatar: "" },
        createdAt: new Date().toISOString(),
        isSubmitting: true
      };
      
      // Add to UI
      setComments((prev) => [tempComment, ...prev]);
      
      // Submit to API
      const newComment = await addComment(post.id, text);
      
      // Replace temp comment with real one from API
      setComments((prev) => 
        prev.map(comment => 
          comment.id === tempComment.id ? newComment : comment
        )
      );
      
      console.log(`Comment added to post ${post.id}: ${text}`);
    } catch (error) {
      // Remove the temporary comment if submission fails
      setComments((prev) => 
        prev.filter(comment => !comment.isSubmitting)
      );
      
      Alert.alert(
        "Error",
        "Failed to add comment: " +
          ((error as Error).message || "Unknown error")
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };
  
  // 处理返回操作
  const handleGoBack = () => {
    router.back();
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


      {/* Fixed Edit Button - Only show if current user is the author */}
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
  // 添加返回按钮样式
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