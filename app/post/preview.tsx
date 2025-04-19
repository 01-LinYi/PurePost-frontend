import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "@/components/SessionProvider";
import { timeAgo } from "@/utils/dateUtils";

/**
 * Post Preview Screen
 * Shows a preview of how the post will appear in the feed
 */
export default function PostPreviewScreen() {
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { user } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Parse the data from URL params
    const postText = decodeURIComponent(params.postText as string || "");
    const mediaUri = params.mediaUri as string || "";
    const mediaType = params.mediaType as string || "";
    const visibility = params.visibility as string || "public";
    const hasDisclaimer = params.hasDisclaimer === "true";
    const disclaimerText = decodeURIComponent(params.disclaimerText as string || "");
    const submitCallback = params.submitCallback as string;
    
    // Parse caption and tags
    const caption = decodeURIComponent(params.caption as string || "");
    const tags = params.tags ? JSON.parse(decodeURIComponent(params.tags as string)) : [];
  
    // Create a mock post object for rendering with the same structure as expected by PostContent
    const previewPost = {
      content: postText,
      image: mediaType === "image" ? mediaUri : null,
      video: mediaType === "video" ? mediaUri : null,
      disclaimer: hasDisclaimer ? disclaimerText : null,
      caption: caption,
      tags: tags,
      user: user,
    };

    // Function to go back to the create post screen
    const handleBackToEdit = () => {
      router.back();
    };
  
    // Render appropriate media content based on available data
    // EXACTLY matching the approach from PostContent.tsx
    const renderMedia = () => {
      if (previewPost.image) {
        return (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: previewPost.image }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          </View>
        );
      } else if (previewPost.video) {
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
  
    // Render caption (similar to PostContent.tsx)
    const renderCaption = () => {
      if (!previewPost.caption) return null;
      
      return (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{previewPost.caption}</Text>
        </View>
      );
    };

    // Render tags (similar to PostContent.tsx)
    const renderTags = () => {
      if (!previewPost.tags || previewPost.tags.length === 0) return null;
      
      return (
        <View style={styles.tagsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tagsScrollContent}
          >
            {previewPost.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(20, insets.bottom) }
        ]}
      >
        <View style={styles.previewInfo}>
          <Text style={styles.previewInfoText}>
            <Ionicons name="eye-outline" size={16} color="#666" /> Preview Mode
          </Text>
          <Text style={styles.visibilityText}>
            <Ionicons
              name={visibility === "public" ? "globe-outline" : "lock-closed-outline"}
              size={16}
              color="#666"
            />
            {" "}
            {visibility === "public" ? "Public" : "Private"} post
          </Text>
        </View>

        {/* Post Card - styled like FeedPostItem */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.username}>{user?.username || "You"}</Text>
                <Text style={styles.timestamp}>just now</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#8e8e93" />
            </TouchableOpacity>
          </View>

          {/* Content Disclaimer */}
          {hasDisclaimer && disclaimerText && (
            <View style={styles.disclaimerContainer}>
              <View style={styles.disclaimerContent}>
                <View style={styles.disclaimerIconContainer}>
                  <Ionicons name="warning-outline" size={18} color="#ffffff" />
                </View>
                <Text style={styles.disclaimerText}>
                  {disclaimerText}
                </Text>
              </View>
            </View>
          )}

          {/* Caption (show above content) */}
          {renderCaption()}

          {/* Post Content */}
          {postText && (
            <Text style={styles.postContent}>{postText}</Text>
          )}

          {/* Media Content */}
          {renderMedia()}

          {/* Tags */}
          {renderTags()}

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={22} color="#555" />
              <Text style={styles.actionText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#555" />
              <Text style={styles.actionText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={22} color="#555" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview Note */}
        <View style={styles.previewNote}>
          <Ionicons name="information-circle-outline" size={20} color="#00c5e3" />
          <Text style={styles.previewNoteText}>
            This is a preview of how your post will appear in the feed. You can go back to make edits or continue to publish.
          </Text>
        </View>

        {/* Preview Actions */}
        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={styles.returnButton}
            onPress={handleBackToEdit}
          >
            <Ionicons name="create-outline" size={20} color="#00c5e3" />
            <Text style={styles.returnButtonText}>Finish Preview</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  
  previewInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10%",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#E0F7FA",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00c5e3",
  },
  previewInfoText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  visibilityText: {
    color: "#666",
    fontSize: 14,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
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
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
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
    marginRight: 12,
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
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 16,
  },
  // Media styles copied EXACTLY from PostContent.tsx
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
  // Caption styles copied from PostContent.tsx
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
  // Tags styles copied from PostContent.tsx
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
  previewNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#00c5e3",
    marginBottom: 16,
  },
  previewNoteText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
    flex: 1,
    lineHeight: 20,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
  },
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F0F8FA",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#00c5e3",
    flex: 1,
    marginRight: 8,
  },
  returnButtonText: {
    color: "#00c5e3",
    fontWeight: "600",
    marginLeft: 8,
  },
});