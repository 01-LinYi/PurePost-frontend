import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { Text, View } from "../Themed";
import { Image } from '@/components/CachedImage';
import { Comment } from "@/types/postType";
import { useSession } from "@/components/SessionProvider";
import { formatDate } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";

interface CommentsListProps {
  comments: Comment[];
  onDeleteComment?: (commentId: number) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  onDeleteComment,
}) => {
  const { user } = useSession();
  const [expandedComment, setExpandedComment] = useState<number | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState<{
    [key: number]: boolean;
  }>({});

  if (comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color="#DDDDDD" />
        <Text style={styles.noCommentsText}>
          No comments yet. Be the first to comment!
        </Text>
      </View>
    );
  }

  const isAuthor = (comment: Comment) => {
    if (user) {
      return Number(comment.user.id) === user.id;
    }
    return false;
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => onDeleteComment && onDeleteComment(commentId),
          style: "destructive",
        },
      ]
    );
  };
  const renderDefaultAvatar = (comment: Comment) => {
    // Use pretty colors for avatar background
    const userId = Number(comment.user.id) || 0;
    const colorIndex = userId % AVATAR_COLORS.length;
    const firstLetter = comment.user.username
      ? comment.user.username.charAt(0).toUpperCase()
      : "?";

    return (
      <View
        style={[
          styles.commentAuthorAvatar,
          { backgroundColor: AVATAR_COLORS[colorIndex] },
        ]}
      >
        <Text style={styles.commentAuthorAvatarText}>{firstLetter}</Text>
      </View>
    );
  };

  const renderAuthorAvatar = (comment: Comment) => {
    // Check if the image URL is valid and not empty
    // Also check if the image is the default avatar
    const hasValidImage =
      comment.user &&
      comment.user.profile_picture &&
      comment.user.profile_picture.trim() !== "" &&
      !avatarLoadError[Number(comment.id)] &&
      !comment.user.profile_picture.includes("defaults");

    if (hasValidImage) {
      return (
        <Image
          source={{ uri: comment.user.profile_picture }}
          style={styles.commentAuthorAvatar}
          onError={() => {
            setAvatarLoadError((prev) => ({
              ...prev,
              [comment.id]: true,
            }));
          }}
        />
      );
    } else {
      return renderDefaultAvatar(comment);
    }
  };

  const toggleExpand = (commentId: number) => {
    if (Number.isNaN(commentId)) return;
    setExpandedComment(expandedComment === commentId ? null : commentId);
  };

  return (
    <View style={styles.container}>
      {comments.map((comment) => {
        const isCommentAuthor = isAuthor(comment);
        const isExpanded = expandedComment == Number(comment.id);

        return (
          <Animated.View
            key={comment.id}
            style={[
              styles.commentItem,
              isCommentAuthor && styles.authorCommentItem,
            ]}
          >
            {renderAuthorAvatar(comment)}
            <View
              style={[
                styles.commentContent,
                isCommentAuthor && styles.authorCommentContent,
              ]}
            >
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>
                  {comment.user.username}
                </Text>
                <Text style={styles.commentDate}>
                  {formatDate(comment.created_at)}
                </Text>
              </View>

              <Text
                style={styles.commentText}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {comment.content}
              </Text>

              <View style={styles.commentActions}>
                {isCommentAuthor && onDeleteComment && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteComment(Number(comment.id))}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF5252" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
                {comment.content.length > 50 && (
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => toggleExpand(Number(comment.id))}
                  >
                    <Text style={styles.expandButtonText}>
                      {isExpanded ? "Show less" : "Show more"}
                    </Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#6B7FD7"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const AVATAR_COLORS = [
  "#FF7676",
  "#4ECDC4",
  "#7A77FF",
  "#FF9F1C",
  "#7DDF64",
  "#A239CA",
  "#8AC6D0",
  "#FF6B6B",
  "#A0D2DB",
  "#FFD166",
];

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  noCommentsText: {
    fontSize: 16,
    color: "#9E9E9E",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 20,
    opacity: 0.9,
  },
  authorCommentItem: {
    opacity: 1,
  },
  commentAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6B7FD7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  commentAuthorAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  authorCommentContent: {
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 3,
    borderLeftColor: "#00c5e3",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "transparent",
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333333",
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333333",
  },
  commentDate: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 6,
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 13,
    color: "#FF5252",
    marginLeft: 4,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 6,
    padding: 4,
  },
  expandButtonText: {
    fontSize: 13,
    color: "#6B7FD7",
    marginRight: 4,
    fontWeight: "500",
  },
});

export default CommentsList;
