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
// Import types from the separate file
import { Post, Comment } from "@/types/postType";
// mock API
const fetchPost = async (
  id: string
): Promise<Post & { comments: Comment[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        text: "This is a sample post content. It demonstrates what a post looks like in the detail view.",
        media: { uri: "https://picsum.photos/200", type: "image/jpeg" },
        author: {
          id: "user123",
          name: "John Doe",
          avatar: "https://picsum.photos/150",
        },
        createdAt: new Date().toISOString(),
        likesCount: 42,
        commentsCount: 7,
        isLiked: false,
        comments: [
          {
            id: "comment1",
            text: "Great post!",
            author: {
              id: "user456",
              name: "Jane Smith",
              avatar: "https://picsum.photos/150",
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: "comment2",
            text: "I completely agree with this.",
            author: {
              id: "user789",
              name: "Alex Johnson",
              avatar: "https://picsum.photos/150",
            },
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }, 600);
  });
};

const PostDetail = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadPostData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPost(String(id));
        setPost(data);
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
        setComments(data.comments);
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

  const handleLike = () => {
    if (!post) return;
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => prev + (newIsLiked ? 1 : -1));
    console.log(`Post ${post.id} ${newIsLiked ? "liked" : "unliked"}`);
  };

  const handleEdit = () => post && router.push(`/post/${post.id}/edit`);
  const handleShare = () =>
    Alert.alert("Share", "Sharing functionality to be implemented");
  const handleSave = () => Alert.alert("Save", "Post saved successfully!");

  const handleAddComment = (text: string) => {
    if (!text.trim() || !post) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text,
      author: { id: "currentuser", name: "You", avatar: "" },
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
    console.log(`Comment added to post ${post.id}: ${text}`);
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

      {/* Fixed Edit Button */}
      <TouchableOpacity
        style={[styles.editButton, { top: insets.top + 10 }]}
        onPress={handleEdit}
        activeOpacity={0.7}
      >
        <Ionicons name="pencil" size={20} color="#FFFFFF" />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>

      <PostContent
        post={post}
        isLiked={isLiked}
        likesCount={likesCount}
        commentsCount={comments.length}
        comments={comments}
        onLike={handleLike}
        onEdit={handleEdit}
        onShare={handleShare}
        onSave={handleSave}
        bottomPadding={Math.max(20, insets.bottom) + 70}
      />

      <CommentInput
        onSubmit={handleAddComment}
        bottomInset={Math.max(10, insets.bottom)}
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
