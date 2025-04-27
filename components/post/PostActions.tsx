import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { InteractType } from "@/hooks/useInteractList";

interface PostActionsProps {
  postId: string;
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  commentsCount: number;
  shareCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}

/**
 * PostActions component displays interactive buttons for post engagement features
 * like like, comment, share and bookmark
 */
const PostActions: React.FC<PostActionsProps> = ({
  postId,
  isLiked,
  isSaved,
  likesCount,
  commentsCount,
  shareCount,
  onLike,
  onComment,
  onShare,
  onSave,
}) => {
  const router = useRouter();

  /**
   * Navigate to the user list screen filtered by interaction type
   * @param type - The type of interaction to filter by (likes, comments, shares)
   */
  const navigateToUserList = (type: InteractType) => {
    try {
      router.push({
        pathname: "/UserListModal",
        params: {
          type:type,
          postId: postId,
          hasError: 0,
        },
      });
    } catch (error) {
      console.error("Failed to navigate to user list:", error);
      router.push({
        pathname: "/UserListModal",
        params: {
          type,
          postId,
          hasError: 1,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Like button and count */}
      <View style={styles.actionGroup}>
        <TouchableOpacity onPress={onLike} style={styles.iconButton}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "#ff4a4a" : "#666"}
          />
        </TouchableOpacity>

        {likesCount > 0 && (
          <TouchableOpacity
            onPress={() => navigateToUserList("likes")}
            style={styles.countButton}
          >
            <Text style={styles.count}>{likesCount}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comment button and count */}
      <View style={styles.actionGroup}>
        <TouchableOpacity onPress={onComment} style={styles.iconButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
        </TouchableOpacity>

        {commentsCount > 0 && (
          <TouchableOpacity
            onPress={() => navigateToUserList("comments")}
            style={styles.countButton}
          >
            <Text style={styles.count}>{commentsCount}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Share button and count */}
      <View style={styles.actionGroup}>
        <TouchableOpacity onPress={onShare} style={styles.iconButton}>
          <Ionicons name="share-social-outline" size={24} color="#666" />
        </TouchableOpacity>

        {shareCount > 0 && (
          <TouchableOpacity
            onPress={() => navigateToUserList("shares")}
            style={styles.countButton}
          >
            <Text style={styles.count}>{shareCount}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bookmark button */}
      <TouchableOpacity onPress={onSave} style={styles.iconButton}>
        <Ionicons
          name={isSaved ? "bookmark" : "bookmark-outline"}
          size={24}
          color={isSaved ? "#00c5e3" : "#666"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 16,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginRight: 2,
  },
  countButton: {
    padding: 4,
  },
  count: {
    fontSize: 14,
    color: "#666",
  },
});

export default PostActions;
