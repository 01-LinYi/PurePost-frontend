// components/post/MyPostItem.tsx - Individual post item for the My Posts screen

import React, { useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { Image } from '@/components/CachedImage';
import { useRouter } from "expo-router";
import { Post, PostVisibility, PostStatus } from "@/types/postType";
import AuthorInfo from "@/components/post/AuthorInfo";
import * as api from "@/utils/api";

interface MyPostItemProps {
  post: Post;
  onDelete: (postId: string) => void;
  onNavigate: (postId: string) => void;
}

/**
 * Renders a single post item in the My Posts list
 */
const MyPostItem: React.FC<MyPostItemProps> = ({
  post,
  onDelete,
  onNavigate,
}) => {
  // Add debugging to check the post object
  useEffect(() => {
    console.log("Post object:", JSON.stringify(post, null, 2));
    console.log("Post keys:", Object.keys(post));
    console.log("Post status:", post.status);
    console.log("Post visibility:", post.visibility);
  }, [post]);

  // Extract the first line as title
  const lines = post.content.split("\n");
  const title = post.caption || "";
  const router = useRouter();

  // Use caption if available, otherwise use content preview
  const hasCaption = !!post.caption;

  // Create a preview of the content
  const contentPreview = post.content
    ? post.content.substring(0, 100) + (post.content.length > 100 ? "..." : "")
    : "No content";

  // Get visibility icon and color
  const getVisibilityProps = (visibility: PostVisibility) => {
    switch (visibility) {
      case "public":
        return { icon: "globe-outline", color: "#00c5e3", text: "Public" };
      case "private":
        return {
          icon: "lock-closed-outline",
          color: "#FF9800",
          text: "Private",
        };
      case "friends":
        return {
          icon: "people-outline",
          color: "#34C759",
          text: "Friends Only",
        };
      default:
        return { icon: "globe-outline", color: "#00c5e3", text: "Public" };
    }
  };

  const getStatusProps = (isStatus: PostStatus) => {
    if (isStatus === "draft")
      return { icon: "document-text-outline", color: "#FF6B6B", text: "Draft" };
    else
      return {
        icon: "checkmark-circle-outline",
        color: "#00c5e3",
        text: "Published",
      };
  };

  const visibilityProps = getVisibilityProps(post.visibility);
  const statusProps = getStatusProps(post.status);

  console.log("Post status:", post.status);
  console.log("Status props:", statusProps);

  const onTogglePin = (postId: string) => {
    // Handle pin/unpin action
    if (post.is_pinned) {
      // Unpin the post
      api
        .unpinPost(Number(postId))
        .then(() => {
          // Update the post state or refetch posts
        })
        .catch((error) => {
          console.error("Error unpinning post:", error);
        });
    } else {
      // Pin the post
      api
        .pinPost(Number(postId))
        .then(() => {
          // Update the post state or refetch posts
        })
        .catch((error) => {
          console.error("Error pinning post:", error);
        });
    }
    Alert.alert(
      post.is_pinned ? "Unpinned" : "Pinned",
      post.is_pinned
        ? "The post has been unpinned."
        : "The post has been pinned to your profile.",
      [
        {
          text: post.is_pinned ? "OK" : "View Profile",
          onPress: post.is_pinned ? () => {} : () => router.replace("/profile"),
        },
        {
          text: "Stay here",
          style: "cancel",
        },
      ]
    );
  };

  const renderTags = () => {
    if (!post.tags || post.tags.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
        contentContainerStyle={styles.tagsContentContainer}
      >
        {post.tags.map((tag, index) => (
          <View key={index} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  // Handle clicking on the post content area
  const handleContentPress = () => {
    onNavigate(post.id);
  };

  return (
    <View style={styles.postItem}>
      <View style={styles.postContent}>
        {/* Use our updated AuthorInfo component */}
        <View style={styles.authorInfoContainer}>
          <AuthorInfo
            user={post.user}
            created_at={post.created_at}
            updated_at={post.updated_at}
            isEdited={post.isEdited}
            isPrivateAccount={post.user.is_private}
          />
        </View>

        {/* Display disclaimer if available */}
        {post.disclaimer && (
          <View style={styles.disclaimerContainer}>
            <View style={styles.disclaimerIconContainer}>
              <Ionicons name="warning-outline" size={18} color="#ffffff" />
            </View>
            <Text style={styles.disclaimerText}>{post.disclaimer}</Text>
          </View>
        )}

        <Pressable onPress={handleContentPress}>
          <View style={styles.titleRow}>
            <Text style={styles.postTitle} numberOfLines={1}>
              {title}
            </Text>

            <View style={styles.statusTagsContainer}>
              {/* Draft tag - styled similarly to the visibility tag */}
              <View style={styles.statusTag}>
                <Ionicons
                  name={statusProps.icon as any}
                  size={12}
                  color={statusProps.color}
                />
                <Text style={[styles.statusText, { color: statusProps.color }]}>
                  {statusProps.text}
                </Text>
              </View>

              <View style={styles.visibilityTag}>
                <Ionicons
                  name={visibilityProps.icon as any}
                  size={12}
                  color={visibilityProps.color}
                />
                <Text
                  style={[
                    styles.visibilityText,
                    { color: visibilityProps.color },
                  ]}
                >
                  {visibilityProps.text}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.postDetailsRow}>
            {/* Display image if available */}
            {post.image && (
              <Image
                source={{ uri: post.image }}
                style={styles.mediaThumbnail}
                resizeMode="cover"
              />
            )}

            {/* Display video thumbnail if available */}
            {!post.image && post.video && (
              <View style={styles.mediaThumbnail}>
                <Ionicons
                  name="videocam"
                  size={30}
                  color="#888"
                  style={{ alignSelf: "center", marginTop: 25 }}
                />
              </View>
            )}

            <View
              style={[
                styles.postTextContent,
                !post.image && !post.video && { flex: 1 },
              ]}
            >
              <Text style={styles.postExcerpt} numberOfLines={2}>
                {contentPreview}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Display tags */}
        {renderTags()}

        {/* Post stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons
              name={post.is_liked ? "heart" : "heart-outline"}
              size={14}
              color={post.is_liked ? "#FF6B6B" : "#888"}
            />
            <Text style={styles.statText}>{post.like_count}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={14} color="#888" />
            <Text style={styles.statText}>{post.comment_count}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="share-outline" size={14} color="#888" />
            <Text style={styles.statText}>{post.share_count}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/post/${post.id}/edit`)}
          >
            <Ionicons name="pencil-outline" size={16} color="#00c5e3" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onTogglePin(post.id)}
          >
            <Ionicons
              name={post.is_pinned ? "pin" : "pin-outline"}
              size={16}
              color="#00c5e3"
            />
            <Text style={styles.actionButtonText}>
              {post.is_pinned ? "Unpin" : "Pin"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(post.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  authorInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginBottom: 8,
  },
  statusTagsContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
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
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#00c5e3",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
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
    fontSize: 12,
    color: "#00c5e3",
    marginLeft: 6,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tagsContentContainer: {
    paddingRight: 16,
  },
  tagChip: {
    backgroundColor: "#e1f5fe",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#00c5e3",
    fontWeight: "500",
  },
});

export default MyPostItem;
