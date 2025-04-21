// components/post/FeedPostItem.tsx

import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { Post, DeepfakeStatus } from "@/types/postType";
import { useRouter } from "expo-router";
import { formatDate } from "@/utils/dateUtils";

type FeedPostItemProps = {
  post: Post;
  onLike: (postId: string) => Promise<any>;
  onDeepfakeDetection: (postId: string) => Promise<boolean>;
  onNavigate: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => Promise<any>;
  onReport: (postId: string, reason: string) => void;
};

// Cache control for images
// temporary disabling cache
const getCacheKey = (uri: string) => {
  return uri;
};

/**
 * Component for rendering individual post items in the feed
 */
export default function FeedPostItem({
  post,
  onLike,
  onDeepfakeDetection,
  onNavigate,
  onSave,
  onShare,
  onReport,
}: FeedPostItemProps) {
  const router = useRouter();
  // Handle share action
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post: ${post.content}`,
        // Add a URL if your app has deep linking
        // url: `yourapp://post/${post.id}`
      });

      // Record share in backend
      await onShare(post.id);
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  // Show options menu
  const showOptions = () => {
    Alert.alert("Post Options", "Choose an action", [
      {
        text: post.is_saved ? "Unsave Post" : "Save Post",
        onPress: () => onSave(post.id),
      },
      {
        text: "Report Post",
        onPress: () => promptReportReason(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Prompt user for report reason
  const promptReportReason = () => {
    Alert.alert("Report Post", "Why are you reporting this post?", [
      {
        text: "Inappropriate Content",
        onPress: () => onReport(post.id, "inappropriate_content"),
      },
      {
        text: "Misinformation",
        onPress: () => onReport(post.id, "misinformation"),
      },
      {
        text: "Spam",
        onPress: () => onReport(post.id, "spam"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Render deepfake detection section
  const renderDeepfakeSection = () => {
    if (!post.image && !post.video) return null;

    // Handle different deepfake detection states
    switch (post.deepfake_status) {
      case "analyzing":
        return (
          <View style={styles.deepfakeAnalyzing}>
            <ActivityIndicator size="small" color="#8c52ff" />
            <Text style={styles.deepfakeAnalyzingText}>Analyzing media...</Text>
          </View>
        );

      case "flagged":
        return (
          <View style={styles.deepfakeFlagged}>
            <Text style={styles.deepfakeHighProbabilityText}>
              High probability of manipulation
            </Text>
            <Text style={styles.deepfakeConfidenceText}>
              This content has been flagged as potentially manipulated
            </Text>
          </View>
        );

      case "not_flagged":
        return (
          <View style={styles.deepfakeSafe}>
            <Text style={styles.deepfakeLowProbabilityText}>
              Low probability of manipulation
            </Text>
            <Text style={styles.deepfakeConfidenceText}>
              No manipulation detected in this content
            </Text>
          </View>
        );

      case "analysis_failed":
        return (
          <View style={styles.deepfakeFailed}>
            <Text style={styles.deepfakeFailedText}>Analysis failed</Text>
            <Text style={styles.deepfakeConfidenceText}>
              Unable to complete the analysis due to technical issues
            </Text>
          </View>
        );

      default:
        // Default button state when no analysis has been requested
        return (
          <TouchableOpacity
            style={styles.deepfakeButton}
            onPress={() => onDeepfakeDetection(post.id)}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.deepfakeButtonText}>
              Request Deepfake Detection
            </Text>
          </TouchableOpacity>
        );
    }
  };

  // Render media content (image or video)
  const renderMedia = () => {
    if (post.image) {
      return (
        <View style={styles.postImageContainer}>
          <Image
            source={{ uri: getCacheKey(post.image) }}
            style={styles.postImage}
            resizeMode="cover"
            progressiveRenderingEnabled={true}
          />
          <View style={styles.imageActionOverlay}>
            {renderDeepfakeSection()}
          </View>
        </View>
      );
    } else if (post.video) {
      // Video rendering would go here
      // This is a placeholder for actual video component implementation
      return (
        <View style={styles.postVideoContainer}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle-outline" size={48} color="#FFFFFF" />
          </View>
          <View style={styles.imageActionOverlay}>
            {renderDeepfakeSection()}
          </View>
        </View>
      );
    }

    return null;
  };

  // Get avatar display
  const renderAvatar = () => {
    const avatarUrl = post.user.profile_picture || "";
    const username = post.user?.username || "User";

    if (avatarUrl) {
      return (
        <Image
          source={{ uri: getCacheKey(avatarUrl) }}
          style={styles.userAvatar}
        />
      );
    } else {
      return (
        <View style={styles.userAvatarPlaceholder}>
          <Text style={styles.avatarText}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }
  };

  // Get username display
  const getUsername = () => {
    return post.user?.username || "User";
  };

  return (
    <TouchableOpacity
      style={styles.postCard}
      activeOpacity={0.9}
      onPress={() => onNavigate(post.id)}
    >
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            style={styles.userAvatarContainer}
            onPress={() => router.push(`/user/${post.user.username}?id=${post.user.id}`)}
          >
            {renderAvatar()}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/user/${post.user.username}?id=${post.user.id}`)}
          >
            <View>
              <Text style={styles.username}>{getUsername()}</Text>
              <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={showOptions}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8e8e93" />
        </TouchableOpacity>
      </View>

      {/* Content Disclaimer - only show if post has a disclaimer */}
      {post.disclaimer && (
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerContent}>
            <View style={styles.disclaimerIconContainer}>
              <Ionicons name="warning-outline" size={18} color="#ffffff" />
            </View>
            <Text style={styles.disclaimerText}>{post.disclaimer}</Text>
          </View>
        </View>
      )}

      <Text style={styles.postContent}>{post.content}</Text>

      {renderMedia()}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.is_liked ? "heart" : "heart-outline"}
            size={22}
            color={post.is_liked ? "#FF3B30" : "#555"}
          />
          <Text style={[styles.actionText, post.is_liked && styles.likedText]}>
            {post.like_count}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => onNavigate(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#555" />
          <Text style={styles.actionText}>{post.comment_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={22} color="#555" />
          <Text style={styles.actionText}>{post.share_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => onSave(post.id)}
        >
          <Ionicons
            name={post.is_saved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={post.is_saved ? "#00c5e3" : "#555"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatarContainer: {
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#00c5e3",
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00c5e3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00c5e3",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 12,
  },
  postImageContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  postVideoContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    height: 240,
  },
  videoPlaceholder: {
    backgroundColor: "#000",
    width: "100%",
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 12,
  },
  postActions: {
    flexDirection: "row",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 6,
  },
  actionText: {
    marginLeft: 5,
    color: "#555",
    fontWeight: "500",
  },
  likedText: {
    color: "#FF3B30",
  },
  disclaimerContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#00c5e3",
    backgroundColor: "#fffbeb",
  },
  disclaimerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  disclaimerIconContainer: {
    backgroundColor: "#00c5e3",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#555555",
  },
  imageActionOverlay: {
    width: "100%",
    padding: 12,
    position: "relative",
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: "center",
  },
  // Deepfake detection styles
  deepfakeButton: {
    backgroundColor: "#00c5e3",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  deepfakeButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "500",
  },
  deepfakeAnalyzing: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    margin: 5,
  },
  deepfakeAnalyzingText: {
    marginLeft: 10,
    color: "#333",
  },
  deepfakeFlagged: {
    padding: 10,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    margin: 5,
  },
  deepfakeSafe: {
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    margin: 5,
  },
  deepfakeFailed: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 5,
  },
  deepfakeHighProbabilityText: {
    fontWeight: "bold",
    color: "#c62828",
  },
  deepfakeLowProbabilityText: {
    fontWeight: "bold",
    color: "#2e7d32",
  },
  deepfakeFailedText: {
    fontWeight: "bold",
    color: "#757575",
  },
  deepfakeConfidenceText: {
    marginTop: 5,
    color: "#666",
  },
});
