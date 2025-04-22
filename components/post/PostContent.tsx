import { StyleSheet, ScrollView, Platform } from "react-native";
import { Text, View } from "@/components/Themed";
import { Image } from '@/components/CachedImage';
import { Post, Comment } from "@/types/postType";
import AuthorInfo from "./AuthorInfo";
import PostActions from "./PostActions";
import CommentsList from "./CommentList";
import { Ionicons } from "@expo/vector-icons";

interface PostContentProps {
  post: Post;
  comments: Comment[];
  onLike: () => void;
  onEdit?: () => void;
  onShare: () => void;
  onSave: () => void;
  ondeleteComment?: (commentId: number) => void;
  bottomPadding: number;
}

/**
 * Displays a post's full content, media, and interactions
 */
const PostContent: React.FC<PostContentProps> = ({
  post,
  comments,
  onLike,
  onEdit,
  onShare,
  onSave,
  ondeleteComment,
  bottomPadding,
}) => {
  // Check if current user is the author (for edit permissions)
  const canEdit = post.isAuthor || post.user?.id === "currentuser";

  // Render appropriate media content based on available data
  const renderMedia = () => {
    if (post.image) {
      return (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: post.image }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      );
    } else if (post.video) {
      return (
        <View style={styles.mediaContainer}>
          {/* You could use a Video component here instead */}
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={40} color="#ffffff" />
            <Text style={styles.videoText}>Video content</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  // Render deepfake detection status if available
  const renderDeepfakeStatus = () => {
    if (!post.deepfake_status || post.deepfake_status === "not_analyzed") {
      return null;
    }

    let statusInfo = {
      color: "#9E9E9E",
      icon: "information-circle-outline",
      text: "Content analysis pending",
    };

    switch (post.deepfake_status) {
      case "flagged":
        statusInfo = {
          color: "#FF3B30",
          icon: "warning-outline",
          text: "This content may be artificially generated or manipulated",
        };
        break;
      case "not_flagged":
        statusInfo = {
          color: "#34C759",
          icon: "checkmark-circle-outline",
          text: "Low probability of manipulation",
        };
        break;
      case "analyzing":
        statusInfo = {
          color: "#007AFF",
          icon: "hourglass-outline",
          text: "Content authenticity verification in progress",
        };
        break;
      case "analysis_failed":
        statusInfo = {
          color: "#FF9500",
          icon: "alert-circle-outline",
          text: "Could not determine content authenticity",
        };
        break;
    }

    return (
      <View style={[styles.statusContainer, { borderColor: statusInfo.color }]}>
        <View
          style={[
            styles.statusIconContainer,
            { backgroundColor: statusInfo.color },
          ]}
        >
          <Ionicons name={statusInfo.icon as any} size={18} color="#ffffff" />
        </View>
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>
    );
  };

  // Render post caption if available
  const renderCaption = () => {
    if (!post.caption) return null;
    
    return (
      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>{post.caption}</Text>
      </View>
    );
  };

  // Render tags if available
  const renderTags = () => {
    if (!post.tags || post.tags.length === 0) return null;
    
    return (
      <View style={styles.tagsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tagsScrollContent}
        >
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: bottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Author info */}
      <AuthorInfo
        user={post.user}
        created_at={post.created_at}
        updated_at={post.updated_at}
        isEdited={post.isEdited || false}
        onEdit={onEdit}
        showEditButton={canEdit}
        isPrivateAccount={post.user?.is_private}
      />

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

      {/* Deepfake detection status */}
      {renderDeepfakeStatus()}

      {/* Post caption - show above content if available */}
      {renderCaption()}

      {/* Post content */}
      <Text style={styles.postText}>{post.content}</Text>

      {/* Media preview */}
      {renderMedia()}
      
      {/* Tags */}
      {renderTags()}

      {/* Interaction bar */}
      <PostActions
        postId={post.id}
        isLiked={post.is_liked}
        isSaved={post.is_saved}
        likesCount={post.like_count}
        commentsCount={post.comment_count}
        shareCount={post.share_count}
        onLike={onLike}
        onShare={onShare}
        onSave={onSave}
        onComment={() => {}}
      />

      {/* Comments section */}
      <View style={styles.commentsContainer}>
        <Text style={styles.commentsTitle}>
          Comments ({post.comment_count})
        </Text>
        <CommentsList 
        comments={comments || []} 
        onDeleteComment={ondeleteComment}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
    marginBottom: 16,
  },
  mediaContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mediaImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  videoPlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#3a3a3a",
    justifyContent: "center",
    alignItems: "center",
  },
  videoText: {
    color: "#ffffff",
    marginTop: 8,
    fontSize: 16,
  },
  commentsContainer: {
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  // Disclaimer styles
  disclaimerContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#00c5e3",
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
    color: "#00c5e3",
  },
  // Status indicator styles
  statusContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 12,
  },
  statusIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  captionContainer: {
    marginBottom: 12,
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#00c5e3",
  },
  captionText: {
    fontSize: 18,
    fontWeight: "600",
    fontStyle: "italic",
    color: "#333333",
    lineHeight: 24,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsScrollContent: {
    paddingBottom: 6,
  },
  tagChip: {
    backgroundColor: "#e1f5fe",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    color: "#00c5e3",
    fontWeight: "500",
  },
});

export default PostContent;